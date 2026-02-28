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

interface VerificationEmailProps {
  name: string;
  verificationUrl: string;
  baseUrl: string;
}

function VerificationEmail({
  name = "Juan",
  verificationUrl = "https://akina.app/verify?token=abc123def456",
  baseUrl = "http://localhost:3000",
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verifica tu cuenta de Akina</Preview>
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
                Gracias por registrarte en Akina. Para activar tu cuenta y
                comenzar a usar nuestro sistema de punto de venta, por favor
                verifica tu dirección de correo electrónico haciendo clic en el
                botón de abajo.
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
                      href={verificationUrl}
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
                      VERIFICAR MI CUENTA
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
                  href={verificationUrl}
                  style={{
                    color: "#00FF88",
                    fontFamily: "Arial, sans-serif",
                    fontSize: 11,
                    fontWeight: 400,
                    lineHeight: "140%",
                    wordBreak: "break-all",
                  }}
                >
                  {verificationUrl}
                </Link>
              </Section>
            </Section>

            {/* Footer */}
            <Section
              style={{
                backgroundColor: "#101010",
                padding: "16px 48px",
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
                AKINA POS © {new Date().getFullYear()}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default VerificationEmail;
