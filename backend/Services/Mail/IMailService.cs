namespace LibraryPlus.Services.Mail;

public interface IMailService
{
    public Task<bool> SendMail(string to, string subject, string body);
}