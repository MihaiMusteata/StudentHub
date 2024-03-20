using System.Text.Json;
using Application.Resources;
using Microsoft.AspNetCore.Identity;

namespace Application.Helpers;

public class ErrorChecker
{
    public static IdentityResult CheckNullObjects(IEnumerable<(string, object?)> objectsToCheck)
    {
        var errorDict = new Dictionary<string, string>();

        foreach (var (itemName, obj) in objectsToCheck)
        {
            if (obj is null)
            {
                errorDict["general"] = string.Format(ErrorTemplate.ItemNotFound, itemName);
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "404",
                    Description = JsonSerializer.Serialize(errorDict)
                });
            }
        }

        return IdentityResult.Success;
    }
    
    

    public static IdentityResult CheckMismatch(IEnumerable<(object, object, string, string)> objectsToCheck)
    {
        var errorDict = new Dictionary<string, string>();

        foreach (var (obj1, obj2, obj1Name, obj2Name) in objectsToCheck)
        {
            if (!obj1.Equals(obj2))
            {
                errorDict["general"] = string.Format(ErrorTemplate.Mismatch, obj1Name, obj2Name);
                return IdentityResult.Failed(new IdentityError
                {
                    Code = "Mismatch",
                    Description = JsonSerializer.Serialize(errorDict)
                });
            }
        }

        return IdentityResult.Success;
    }
}