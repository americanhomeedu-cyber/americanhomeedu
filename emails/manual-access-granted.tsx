import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Button,
} from '@react-email/components'
import * as s from './styles'

export function ManualAccessGranted({
  name,
  courseTitle,
  dashboardUrl,
}: {
  name: string
  courseTitle: string
  dashboardUrl: string
}) {
  return (
    <Html lang="ru">
      <Head />
      <Preview>Вам открыт доступ к курсу «{courseTitle}»</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.brandMain}>American Home Blueprint</Text>
            <Text style={s.brandSub}>with Alla</Text>
          </Section>
          <Section style={s.content}>
            <Heading style={s.h1}>Здравствуйте, {name}!</Heading>
            <Text style={s.text}>
              Вам открыт доступ к курсу «{courseTitle}». Войдите в кабинет, чтобы
              начать обучение.
            </Text>
            <Button href={dashboardUrl} style={s.button}>
              Открыть курс
            </Button>
          </Section>
          <Section style={s.footerText}>
            Если кнопка не работает, откройте ссылку: {dashboardUrl}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default ManualAccessGranted
