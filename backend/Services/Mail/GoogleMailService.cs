using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
namespace LibraryPlus.Services.Mail;

public class GoogleMailService(string smtpServer, int port, string fromMail, string password) : IMailService
{
    private readonly string _smtpServer = smtpServer;
    private readonly int _port = port;
    private readonly string _fromMail = fromMail;
    private readonly string _password = password;

    public async Task<bool> SendMail(string to, string subject, string body)
    {
        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress("LibraryPlus", _fromMail));
            email.To.Add(new MailboxAddress("To Name", to));
            email.Subject = subject;
            email.Body = new TextPart("plain") { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_smtpServer, _port, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_fromMail, _password);
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