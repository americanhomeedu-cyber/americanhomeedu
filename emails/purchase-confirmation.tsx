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

export function PurchaseConfirmation({
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
      <Preview>Доступ к курсу «{courseTitle}» открыт</Preview>
      <Body style={s.main}>
        <Container style={s.container}>
          <Section style={s.header}>
            <Text style={s.brandMain}>American Home Blueprint</Text>
            <Text style={s.brandSub}>with Alla</Text>
          </Section>
          <Section style={s.content}>
            <Heading style={s.h1}>Поздравляем с покупкой, {name}!</Heading>
            <Text style={s.text}>
              Вы получили доступ к курсу «{courseTitle}». Доступ навсегда —
              возвращайтесь к материалам в любой момент.
            </Text>
            <Button href={dashboardUrl} style={s.button}>
              Перейти к курсу
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

export default PurchaseConfirmation
