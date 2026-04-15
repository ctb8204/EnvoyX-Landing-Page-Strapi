'use strict';

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  try {
    const client = app.db?.config?.connection?.client || 'unknown';
    const articleRows = await app.db.connection('articles').count({ count: '*' }).first();
    const fileRows = await app.db.connection('files').count({ count: '*' }).first();
    const relationRows = await app.db.connection('files_related_mph').count({ count: '*' }).first();
    const orphanRows = await app.db
      .connection('files as f')
      .leftJoin('files_related_mph as r', 'r.file_id', 'f.id')
      .whereNull('r.file_id')
      .count({ count: '*' })
      .first();

    const articleDocPairs = await app.db
      .connection('articles')
      .select('slug', 'document_id')
      .count({ count: '*' })
      .groupBy('slug', 'document_id');

    const pairedDraftPublishedDocs = articleDocPairs.filter((row) => Number(row.count) > 1).length;

    const orphanFiles = await app.db
      .connection('files as f')
      .leftJoin('files_related_mph as r', 'r.file_id', 'f.id')
      .whereNull('r.file_id')
      .select('f.id', 'f.name', 'f.url')
      .limit(20);

    console.log(
      JSON.stringify(
        {
          databaseClient: client,
          warning:
            client === 'sqlite'
              ? 'Production should not run on sqlite; prefer postgres on Strapi Cloud.'
              : null,
          articlesTableRows: Number(articleRows?.count || 0),
          files: Number(fileRows?.count || 0),
          fileRelations: Number(relationRows?.count || 0),
          orphanFileCount: Number(orphanRows?.count || 0),
          pairedDraftPublishedDocs,
          orphanFiles,
        },
        null,
        2
      )
    );
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
