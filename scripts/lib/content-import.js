'use strict';

const fs = require('fs-extra');
const path = require('path');
const mime = require('mime-types');
const legacyContent = require('../../data/data.json');
const envoyxContent = require('../../data/envoyx-content');

const ARTICLE_UID = 'api::article.article';
const AUTHOR_UID = 'api::author.author';
const CATEGORY_UID = 'api::category.category';
const GLOBAL_UID = 'api::global.global';
const ABOUT_UID = 'api::about.about';
const NEWSLETTER_ISSUE_UID = 'api::newsletter-issue.newsletter-issue';

const normalizeString = (value) => String(value ?? '').trim();
const normalizeKey = (value) => normalizeString(value).toLowerCase();
const uploadsRoot = path.join(process.cwd(), 'data', 'uploads');
const buildEnvoyxCoverName = (slug) => `envoyx-cover-${slug}.png`;

async function setPublicPermissions(strapi, permissionsByController) {
  const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
    where: { type: 'public' },
  });

  if (!publicRole) return;

  for (const [controller, actions] of Object.entries(permissionsByController)) {
    for (const action of actions) {
      const permissionAction = `api::${controller}.${controller}.${action}`;
      const existingPermission = await strapi
        .query('plugin::users-permissions.permission')
        .findOne({
          where: {
            action: permissionAction,
            role: publicRole.id,
          },
        });

      if (existingPermission) continue;

      await strapi.query('plugin::users-permissions.permission').create({
        data: {
          action: permissionAction,
          role: publicRole.id,
        },
      });
    }
  }
}

function getFileSizeInBytes(filePath) {
  return fs.statSync(filePath).size;
}

function getFileData(fileName) {
  const filePath = path.join(uploadsRoot, fileName);
  const ext = path.extname(fileName).slice(1);

  return {
    filepath: filePath,
    originalFileName: path.basename(fileName),
    size: getFileSizeInBytes(filePath),
    mimetype: mime.lookup(ext || '') || '',
  };
}

async function uploadFile(strapi, file, name) {
  return strapi.plugin('upload').service('upload').upload({
    files: file,
    data: {
      fileInfo: {
        alternativeText: `An image uploaded to Strapi called ${name}`,
        caption: name,
        name,
      },
    },
  });
}

async function ensureUploadedFile(strapi, fileName) {
  const normalizedFileName = normalizeString(fileName);
  if (!normalizedFileName) return null;

  const baseName = path.parse(normalizedFileName).name;
  const existingFile = await strapi.query('plugin::upload.file').findOne({
    where: { name: baseName },
  });

  if (existingFile) return existingFile;

  const fileData = getFileData(normalizedFileName);
  const [uploadedFile] = await uploadFile(strapi, fileData, baseName);
  return uploadedFile;
}

async function resolveOptionalUpload(strapi, fileName) {
  const normalizedFileName = normalizeString(fileName)
  if (!normalizedFileName) return null

  const filePath = path.join(uploadsRoot, normalizedFileName)
  const exists = await fs.pathExists(filePath)
  if (!exists) return null

  return ensureUploadedFile(strapi, normalizedFileName)
}

async function ensureUploadedFiles(strapi, fileNames = []) {
  const files = [];
  for (const fileName of fileNames) {
    const uploadedFile = await ensureUploadedFile(strapi, fileName);
    if (uploadedFile) files.push(uploadedFile);
  }
  return files;
}

async function updateBlocks(strapi, blocks = []) {
  const updatedBlocks = [];

  for (const block of blocks) {
    if (block.__component === 'shared.media') {
      const file = await ensureUploadedFile(strapi, block.file);
      updatedBlocks.push({ ...block, file });
      continue;
    }

    if (block.__component === 'shared.slider') {
      const files = await ensureUploadedFiles(strapi, block.files);
      updatedBlocks.push({ ...block, files });
      continue;
    }

    updatedBlocks.push(block);
  }

  return updatedBlocks;
}

async function createEntry(strapi, uid, entry) {
  return strapi.documents(uid).create({ data: entry });
}

async function upsertDocument(strapi, uid, existing, data) {
  if (existing?.documentId) {
    return strapi.documents(uid).update({
      documentId: existing.documentId,
      data,
    });
  }

  return strapi.documents(uid).create({ data });
}

async function syncPublicationState(strapi, uid, document, shouldPublish) {
  if (!document?.documentId) return document;

  const service = strapi.documents(uid);

  if (shouldPublish) {
    if (typeof service.publish === 'function') {
      await service.publish({
        documentId: document.documentId,
      });
    } else {
      await service.update({
        documentId: document.documentId,
        status: 'published',
        data: {},
      });
    }
  } else {
    if (typeof service.unpublish === 'function') {
      await service.unpublish({
        documentId: document.documentId,
      });
    }
  }

  return service.findOne({
    documentId: document.documentId,
  });
}

async function findAllDocuments(strapi, uid) {
  return strapi.documents(uid).findMany({
    sort: ['id:asc'],
  });
}

async function findBySlug(strapi, uid, slug) {
  const normalizedSlug = normalizeString(slug);
  if (!normalizedSlug) return null;

  const exactMatch = await strapi.documents(uid).findFirst({
    filters: { slug: normalizedSlug },
  });

  if (exactMatch) return exactMatch;

  const allDocuments = await findAllDocuments(strapi, uid);
  return allDocuments.find((entry) => normalizeKey(entry.slug) === normalizeKey(normalizedSlug)) || null;
}

async function importLegacyCategories(strapi) {
  for (const category of legacyContent.categories) {
    const existing = await findBySlug(strapi, CATEGORY_UID, category.slug);
    await upsertDocument(strapi, CATEGORY_UID, existing, category);
  }
}

async function importLegacyAuthors(strapi) {
  for (const author of legacyContent.authors) {
    const avatar = author.avatar ? await ensureUploadedFile(strapi, author.avatar) : null;
    const existingAuthors = await findAllDocuments(strapi, AUTHOR_UID);
    const existing = existingAuthors.find((entry) => normalizeKey(entry.name) === normalizeKey(author.name));

    await upsertDocument(strapi, AUTHOR_UID, existing, {
      ...author,
      avatar,
    });
  }
}

async function importLegacyArticles(strapi) {
  const categories = await findAllDocuments(strapi, CATEGORY_UID);
  const authors = await findAllDocuments(strapi, AUTHOR_UID);

  for (const article of legacyContent.articles) {
    const existing = await findBySlug(strapi, ARTICLE_UID, article.slug);
    const cover = await ensureUploadedFile(strapi, `${article.slug}.jpg`);
    const updatedBlocks = await updateBlocks(strapi, article.blocks || []);
    const category = categories.find((entry) => entry.id === article.category?.id) || null;
    const author = authors.find((entry) => entry.id === article.author?.id) || null;

    const savedArticle = await upsertDocument(strapi, ARTICLE_UID, existing, {
      ...article,
      cover,
      blocks: updatedBlocks,
      category: category ? { id: category.id } : null,
      author: author ? { id: author.id } : null,
    });

    await syncPublicationState(strapi, ARTICLE_UID, savedArticle, true);
  }
}

async function importLegacyGlobal(strapi) {
  const existing = await strapi.documents(GLOBAL_UID).findFirst();
  const favicon = await ensureUploadedFile(strapi, 'favicon.png');
  const shareImage = await ensureUploadedFile(strapi, 'default-image.png');

  const savedGlobal = await upsertDocument(strapi, GLOBAL_UID, existing, {
    ...legacyContent.global,
    favicon,
    defaultSeo: {
      ...legacyContent.global.defaultSeo,
      shareImage,
    },
  });

  await syncPublicationState(strapi, GLOBAL_UID, savedGlobal, true);
}

async function importLegacyAbout(strapi) {
  const existing = await strapi.documents(ABOUT_UID).findFirst();
  const blocks = await updateBlocks(strapi, legacyContent.about.blocks || []);

  const savedAbout = await upsertDocument(strapi, ABOUT_UID, existing, {
    ...legacyContent.about,
    blocks,
  });

  await syncPublicationState(strapi, ABOUT_UID, savedAbout, true);
}

async function importLegacySeedData(strapi) {
  await importLegacyCategories(strapi);
  await importLegacyAuthors(strapi);
  await importLegacyArticles(strapi);
  await importLegacyGlobal(strapi);
  await importLegacyAbout(strapi);
}

async function ensureEnvoyxCategories(strapi) {
  const existingCategories = await findAllDocuments(strapi, CATEGORY_UID);

  const insightCategory = existingCategories.find(
    (entry) => normalizeKey(entry.name) === 'insight' || normalizeKey(entry.slug) === 'insight'
  );

  if (insightCategory) {
    await upsertDocument(strapi, CATEGORY_UID, insightCategory, {
      name: 'Insight',
      slug: 'insight',
      description:
        insightCategory.description || 'Market, product, and infrastructure analysis from EnvoyX.',
    });
  }

  for (const category of envoyxContent.categories) {
    const currentCategories = await findAllDocuments(strapi, CATEGORY_UID);
    const existing = currentCategories.find(
      (entry) => normalizeKey(entry.slug) === normalizeKey(category.slug) || normalizeKey(entry.name) === normalizeKey(category.name)
    );

    await upsertDocument(strapi, CATEGORY_UID, existing, category);
  }
}

async function ensureEnvoyxAuthors(strapi) {
  for (const author of envoyxContent.authors) {
    const allAuthors = await findAllDocuments(strapi, AUTHOR_UID);
    const existing = allAuthors.find((entry) => normalizeKey(entry.name) === normalizeKey(author.name));
    const avatar = author.avatar ? await ensureUploadedFile(strapi, author.avatar) : null;

    await upsertDocument(strapi, AUTHOR_UID, existing, {
      name: author.name,
      email: author.email,
      avatar,
    });
  }
}

async function upsertEnvoyxArticles(strapi) {
  const categories = await findAllDocuments(strapi, CATEGORY_UID);
  const authors = await findAllDocuments(strapi, AUTHOR_UID);
  const articleMap = new Map();

  for (const article of envoyxContent.articles) {
    const existing = await findBySlug(strapi, ARTICLE_UID, article.slug);
    const category = categories.find((entry) => normalizeKey(entry.slug) === normalizeKey(article.categorySlug));
    const author = authors.find((entry) => normalizeKey(entry.name) === normalizeKey(article.authorName));
    const cover =
      (article.coverFile ? await resolveOptionalUpload(strapi, article.coverFile) : null) ||
      (await resolveOptionalUpload(strapi, buildEnvoyxCoverName(article.slug)));
    const markdownBody = normalizeString(article.HTML_Editor)
    const sourceBlocks =
      Array.isArray(article.blocks) && article.blocks.length
        ? article.blocks
        : markdownBody
          ? [
              {
                __component: 'shared.rich-text',
                body: markdownBody
              }
            ]
          : [];
    const blocks = await updateBlocks(strapi, sourceBlocks);

    const savedArticle = await upsertDocument(strapi, ARTICLE_UID, existing, {
      title: article.title,
      slug: article.slug,
      description: article.description,
      cover,
      author: author ? { id: author.id } : null,
      category: category ? { id: category.id } : null,
      blocks,
      HTML_Editor: null,
    });

    const syncedArticle = await syncPublicationState(
      strapi,
      ARTICLE_UID,
      savedArticle,
      Boolean(article.published)
    );

    articleMap.set(article.slug, syncedArticle);
  }

  return articleMap;
}

async function upsertEnvoyxNewsletterIssue(strapi, articleMap) {
  const issueData = envoyxContent.newsletterIssue;
  const existingBySlug = await findBySlug(strapi, NEWSLETTER_ISSUE_UID, issueData.slug);
  const existingByLegacySlug = issueData.overwriteExistingSlug
    ? await findBySlug(strapi, NEWSLETTER_ISSUE_UID, issueData.overwriteExistingSlug)
    : null;
  const existingIssue = existingBySlug || existingByLegacySlug || (await strapi.documents(NEWSLETTER_ISSUE_UID).findFirst());

  const headerImage = issueData.headerImageFile
    ? await ensureUploadedFile(strapi, issueData.headerImageFile)
    : null;

  const featuredArticles = issueData.featuredArticleSlugs
    .map((slug) => articleMap.get(slug))
    .filter(Boolean)
    .map((article) => ({ id: article.id }));

  return upsertDocument(strapi, NEWSLETTER_ISSUE_UID, existingIssue, {
    title: issueData.title,
    slug: issueData.slug,
    subject: issueData.subject,
    preheader: issueData.preheader,
    issueDate: issueData.issueDate,
    headerImage,
    intro: issueData.intro,
    featuredArticles,
    productUpdateTitle: issueData.productUpdateTitle,
    productUpdateBody: issueData.productUpdateBody,
    ecosystemInsightTitle: issueData.ecosystemInsightTitle,
    ecosystemInsightBody: issueData.ecosystemInsightBody,
    ctaLabel: issueData.ctaLabel,
    ctaUrl: issueData.ctaUrl,
  });
}

async function importEnvoyxContent(strapi) {
  await ensureEnvoyxCategories(strapi);
  await ensureEnvoyxAuthors(strapi);
  const articleMap = await upsertEnvoyxArticles(strapi);
  return upsertEnvoyxNewsletterIssue(strapi, articleMap);
}

async function importAllSeedContent(strapi) {
  await setPublicPermissions(strapi, {
    article: ['find', 'findOne'],
    category: ['find', 'findOne'],
    author: ['find', 'findOne'],
    global: ['find', 'findOne'],
    about: ['find', 'findOne'],
  });

  await importLegacySeedData(strapi);
  await importEnvoyxContent(strapi);
}

async function isFirstRun(strapi) {
  const pluginStore = strapi.store({
    environment: strapi.config.environment,
    type: 'type',
    name: 'setup',
  });
  const initHasRun = await pluginStore.get({ key: 'initHasRun' });
  await pluginStore.set({ key: 'initHasRun', value: true });
  return !initHasRun;
}

async function seedExampleApp(strapi) {
  const shouldImportSeedData = await isFirstRun(strapi);

  if (!shouldImportSeedData) {
    console.log(
      'Seed data has already been imported. We cannot reimport unless you clear your database first.'
    );
    return;
  }

  console.log('Setting up the template...');
  await importAllSeedContent(strapi);
  console.log('Ready to go');
}

module.exports = {
  importAllSeedContent,
  importEnvoyxContent,
  seedExampleApp,
  setPublicPermissions,
};
