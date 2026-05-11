using Resend;

namespace LibraryPlus.Services.Mail;

public class MailService(IResend resend)
{
    private readonly IResend _resendClient = resend;

    public async Task<bool> SendMail(string to, string subject, string body)
    {
        var res = await _resendClient.EmailSendAsync(new EmailMessage
        {
            From = "onboarding@resend.dev",
            To = to,
            Subject = subject,
            TextBody = body
        });
        return res.Success;
    }
}