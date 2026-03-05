import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  baseUrl: string;
}

function PasswordResetEmail({
  name = "Juan",
  resetUrl = "https://akina.app/reset-password?token=abc123def456",
  baseUrl = "http://localhost:3000",
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de Akina</Preview>
      <Tailwind>
        <Body className="m-0 font-sans">
          <Container className="mx-auto max-w-[500px]">
            {/* Header */}
            <Section className="border-b border-solid border-[#2f2f2f] bg-[#141414] px-8 py-5 text-center">
              <Img
                src={`${baseUrl}/app-logo.png`}
                width={112}
                height={36}
                alt="Akina"
                style={{ margin: "0 auto" }}
              />
            </Section>

            {/* Body */}
            <Section className="bg-[#141414]" style={{ padding: "54px 36px" }}>
              {/* Greeting */}
              <Text
                style={{
                  color: "#FFFFFF",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: -0.5,
                  margin: "0 0 12px",
                }}
              >
                ¡Hola, {name}!
              </Text>

              <Text
                style={{
                  color: "#A1A1A1",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 15,
                  fontWeight: 400,
                  lineHeight: "170%",
                  margin: "0 0 28px",
                }}
              >
                Recibimos una solicitud para restablecer la contraseña de tu
                cuenta en Akina. Haz clic en el botón de abajo para crear una
                nueva contraseña.
              </Text>

              {/* CTA Button */}
              <table
                cellPadding={0}
                cellSpacing={0}
                role="presentation"
                width="100%"
              >
                <tr>
                  <td align="center" style={{ backgroundColor: "#00FF88" }}>
                    <Button
                      href={resetUrl}
                      style={{
                        display: "inline-block",
                        width: "100%",
                        backgroundColor: "#00FF88",
                        color: "#0C0C0C !important",
                        fontFamily: "Arial, sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        textAlign: "center",
                        padding: "16px 24px",
                        textDecoration: "none",
                        boxSizing: "border-box",
                      }}
                    >
                      RESTABLECER MI CONTRASEÑA
                    </Button>
                  </td>
                </tr>
              </table>

              {/* Fallback URL */}
              <Section
                style={{
                  backgroundColor: "#1A1A1A",
                  padding: "16px 20px",
                  marginTop: 28,
                }}
              >
                <Text
                  style={{
                    color: "#6a6a6a",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 12,
                    fontWeight: 400,
                    lineHeight: "150%",
                    margin: "0",
                  }}
                >
                  Si el botón no funciona, copia y pega este enlace en tu
                  navegador:
                </Text>
                <Link
                  href={resetUrl}
                  style={{
                    color: "#00FF88",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 11,
                    fontWeight: 400,
                    lineHeight: "140%",
                    wordBreak: "break-all",
                  }}
                >
                  {resetUrl}
                </Link>
              </Section>

              <Text
                style={{
                  color: "#6a6a6a",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  textAlign: "center",
                  margin: "28px 0 0",
                  textWrap: "balance",
                }}
              >
                *Si no realizaste esta solicitud puedes ignorar este correo y tu
                contraseña no será modificada.
              </Text>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: "#101010",
                padding: "16px 36px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  color: "#4a4a4a",
                  fontFamily: "Arial, sans-serif",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                  margin: 0,
                }}
              >
                AKINA © {new Date().getFullYear()}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default PasswordResetEmail;
