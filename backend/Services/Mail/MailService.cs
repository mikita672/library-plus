using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
namespace LibraryPlus.Services.Mail;

public class MailService(IConfiguration config)
{
    private readonly string smtpServer = config["Mail:SmtpServer"]!;
    private readonly int port = int.Parse(config["Mail:Port"]!);
    private readonly string fromMail = config["Mail:Username"]!;
    private readonly string password = config["Mail:Password"]!;

    public async Task<bool> SendMail(string to, string subject, string body)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("LibraryPlus", fromMail));
            email.To.Add(new MailboxAddress("To Name", to));
            email.Subject = subject;
            email.Body = new TextPart("plain") { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpServer, port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(fromMail, password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            return true;
        }
        catch
        {
            return false;
        }
    }
}