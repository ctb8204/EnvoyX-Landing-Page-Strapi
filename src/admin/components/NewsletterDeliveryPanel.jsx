import * as React from 'react'
import { useFetchClient, useNotification } from '@strapi/strapi/admin'
import { Box, Button, Flex, TextInput, Typography } from '@strapi/design-system'

const NEWSLETTER_ISSUE_UID = 'api::newsletter-issue.newsletter-issue'

const formatTimestamp = (value) => {
  if (!value) return null

  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value))
  } catch {
    return value
  }
}

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}

const NewsletterDeliveryPanelContent = ({ documentId, initialSentAt, initialLastTestSentAt }) => {
  const { post } = useFetchClient()
  const { toggleNotification } = useNotification()
  const [testEmail, setTestEmail] = React.useState('')
  const [isSendingTest, setIsSendingTest] = React.useState(false)
  const [isSendingLive, setIsSendingLive] = React.useState(false)
  const [sentAt, setSentAt] = React.useState(initialSentAt || null)
  const [lastTestSentAt, setLastTestSentAt] = React.useState(initialLastTestSentAt || null)

  React.useEffect(() => {
    setSentAt(initialSentAt || null)
  }, [initialSentAt])

  React.useEffect(() => {
    setLastTestSentAt(initialLastTestSentAt || null)
  }, [initialLastTestSentAt])

  const isSaved = Boolean(documentId)
  const hasBeenSent = Boolean(sentAt)
  const sendDisabled = !isSaved || hasBeenSent || isSendingLive || isSendingTest

  const handleSendTest = async () => {
    const normalizedEmail = testEmail.trim()

    if (!normalizedEmail) {
      toggleNotification({
        type: 'warning',
        message: 'Enter a test recipient email address before sending.'
      })
      return
    }

    setIsSendingTest(true)

    try {
      await post(`/admin/newsletter-admin/issues/${encodeURIComponent(documentId)}/send-test`, {
        to: normalizedEmail
      })

      const nextTimestamp = new Date().toISOString()
      setLastTestSentAt(nextTimestamp)
      toggleNotification({
        type: 'success',
        message: `Test newsletter sent to ${normalizedEmail}.`
      })
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: getErrorMessage(error, 'Unable to send newsletter test email.')
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const handleSendLive = async () => {
    if (!window.confirm('Send this newsletter to all currently subscribed recipients?')) {
      return
    }

    setIsSendingLive(true)

    try {
      const response = await post(`/admin/newsletter-admin/issues/${encodeURIComponent(documentId)}/send`)
      const nextTimestamp = new Date().toISOString()
      setSentAt(nextTimestamp)

      toggleNotification({
        type: 'success',
        message: `Newsletter sent to ${response?.data?.sentCount ?? 'all'} subscribed recipients.`
      })
    } catch (error) {
      toggleNotification({
        type: 'danger',
        message: getErrorMessage(error, 'Unable to send newsletter issue.')
      })
    } finally {
      setIsSendingLive(false)
    }
  }

  return (
    <Flex direction="column" alignItems="stretch" gap={4} width="100%">
      <Flex direction="column" alignItems="stretch" gap={2}>
        <Typography variant="omega" textColor="neutral600">
          Use the current newsletter issue document to send a test email or deliver the issue to all subscribed recipients.
        </Typography>
        {!isSaved ? (
          <Typography variant="omega" textColor="danger600">
            Save this issue before sending.
          </Typography>
        ) : null}
        {hasBeenSent ? (
          <Typography variant="omega" textColor="success600">
            Sent on {formatTimestamp(sentAt)}.
          </Typography>
        ) : null}
        {lastTestSentAt ? (
          <Typography variant="omega" textColor="neutral600">
            Last test sent on {formatTimestamp(lastTestSentAt)}.
          </Typography>
        ) : null}
      </Flex>

      <Box>
        <TextInput
          label="Test recipient"
          name="newsletter-test-email"
          placeholder="name@example.com"
          value={testEmail}
          onChange={(event) => setTestEmail(event.target.value)}
          disabled={!isSaved || isSendingTest || isSendingLive}
        />
      </Box>

      <Flex direction="column" alignItems="stretch" gap={2}>
        <Button
          onClick={handleSendTest}
          loading={isSendingTest}
          disabled={!isSaved || isSendingLive}
          variant="secondary"
        >
          Send test
        </Button>

        <Button
          onClick={handleSendLive}
          loading={isSendingLive}
          disabled={sendDisabled}
        >
          Send newsletter
        </Button>
      </Flex>
    </Flex>
  )
}

const NewsletterDeliveryPanel = ({ model, documentId, document }) => {
  if (model !== NEWSLETTER_ISSUE_UID) {
    return null
  }

  return {
    id: 'newsletter-delivery-panel',
    title: 'Newsletter Delivery',
    content: (
      <NewsletterDeliveryPanelContent
        documentId={documentId}
        initialSentAt={document?.sentAt}
        initialLastTestSentAt={document?.lastTestSentAt}
      />
    )
  }
}

NewsletterDeliveryPanel.type = 'newsletter-delivery'

export default NewsletterDeliveryPanel
