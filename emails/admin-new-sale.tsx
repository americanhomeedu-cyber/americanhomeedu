import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
} from '@react-email/components'
import * as s from './styles'

export function AdminNewSale({
  customerName,
  customerEmail,
  courseTitle,
  amount,
}: {
  customerName?: string | null
  customerEmail: string
  courseTitle: string
  amount: string
}) {
  return (
    <Html lang="ru">
      <Head />
      <Preview>Новая покупка: {courseTitle}</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.brandMain}>American Home Blueprint</Text>
            <Text style={s.brandSub}>Admin</Text>
          </Section>
          <Section style={s.content}>
            <Heading style={s.h1}>💰 Новая покупка</Heading>
            <Section style={s.info}>
              <Text style={{ margin: 0 }}>
                <strong>Курс:</strong> {courseTitle}
              </Text>
              <Text style={{ margin: '6px 0 0' }}>
                <strong>Сумма:</strong> {amount}
              </Text>
              <Text style={{ margin: '6px 0 0' }}>
                <strong>Клиент:</strong> {customerName || '—'} ({customerEmail})
              </Text>
            </Section>
            <Text style={s.text}>Доступ к курсу выдан автоматически.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default AdminNewSale
