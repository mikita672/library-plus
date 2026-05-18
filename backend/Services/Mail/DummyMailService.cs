namespace LibraryPlus.Services.Mail;

public class DummyMailService : IMailService
{
    public async Task<bool> SendMail(string to, string subject, string body)
    {
        return true;
    }
}