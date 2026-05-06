using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LibraryPlus.Models.User;
using Microsoft.IdentityModel.Tokens;

namespace LibraryPlus.Services.Auth;

public class JwtService(IConfiguration config)
{
    private readonly byte[] _key = Encoding.UTF8.GetBytes(config["Jwt:Key"]!);
    private readonly string _issuer = config["Jwt:Issuer"]!;
    private readonly string _audience = config["Jwt:Audience"]!;

    public string GenerateJwtToken(UserModel user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([new Claim("sub", user.Id)]),
            Expires = DateTime.UtcNow.AddMinutes(15),
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(_key), SecurityAlgorithms.HmacSha256Signature
            )
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public bool IsValid(string? token)
    {
        if (string.IsNullOrEmpty(token))
        {
            return false;
        }

        try
        {
            var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
            return jwt.ValidTo >= DateTime.UtcNow;
        }
        catch
        {
            return false;
        }
    }

}