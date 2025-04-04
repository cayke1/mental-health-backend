interface EmailTemplateProps {
  heading: string;
  body: any;
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;
}

export const getEmailTemplate = ({
  heading,
  body,
  ctaText,
  ctaUrl,
  footerText = '© 2025 Sereno. Todos os direitos reservados.',
}: EmailTemplateProps): string => {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${heading} - Sereno</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
      
      body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f8fcfb;
        color: #2e3440;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      
      .header {
        text-align: center;
        padding: 20px 0;
      }
      
      .logo {
        font-size: 28px;
        font-weight: 700;
        color: #25ab8c;
        text-decoration: none;
      }
      
      .content {
        background-color: #ffffff;
        border-radius: 12px;
        padding: 30px;
        margin: 20px 0;
        border: 1px solid #e2efeb;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      }
      
      .heading {
        font-size: 24px;
        font-weight: 600;
        color: #25ab8c;
        margin-bottom: 20px;
      }
      
      .body {
        font-size: 16px;
        line-height: 1.6;
        color: #2e3440;
        margin-bottom: 25px;
      }
      
      .cta {
        display: block;
        width: 200px;
        margin: 30px auto;
        padding: 12px 24px;
        background: linear-gradient(to right, #25ab8c, #0ca6eb);
        color: #ffffff;
        text-align: center;
        text-decoration: none;
        font-weight: 500;
        border-radius: 6px;
      }
      
      .footer {
        text-align: center;
        padding: 20px 0;
        font-size: 14px;
        color: #888888;
      }
      
      .social {
        text-align: center;
        margin: 15px 0;
      }
      
      .social a {
        display: inline-block;
        margin: 0 10px;
        color: #25ab8c;
        text-decoration: none;
      }
      
      @media only screen and (max-width: 600px) {
        .container {
          padding: 10px;
        }
        
        .content {
          padding: 20px;
        }
        
        .heading {
          font-size: 22px;
        }
        
        .cta {
          width: 180px;
          padding: 10px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <span class="logo">Sereno</span>
      </div>
      
      <div class="content">
        <h1 class="heading">${heading}</h1>
        <div class="body">
          ${typeof body === 'string' ? body : ''}
        </div>
        
        ${
          ctaText && ctaUrl
            ? `
        <a href="${ctaUrl}" class="cta">
          ${ctaText}
        </a>
        `
            : ''
        }
      </div>
      
      <div class="social">
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
        <a href="#">Facebook</a>
      </div>
      
      <div class="footer">
        ${footerText}
        <p>Se você não deseja mais receber nossos emails, <a href="#" style="color: #25ab8c;">clique aqui para cancelar.</a></p>
      </div>
    </div>
  </body>
  </html>
    `;
};
