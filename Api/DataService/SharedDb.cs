using System.Collections.Concurrent;
using Api.Models;

namespace Api.DataService;

public class SharedDb
{
  private readonly ConcurrentDictionary<string, UserConnection> _connections = new();
  
  public ConcurrentDictionary<string, UserConnection> connections => _connections;
}