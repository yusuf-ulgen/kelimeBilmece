using Microsoft.AspNetCore.SignalR;
using Caterpillar.Api.Models;

namespace Caterpillar.Api.Hubs;

public class GameHub : Hub
{
    private static readonly Dictionary<string, string> _waitingPlayers = new(); // Category -> ConnectionId

    public async Task JoinGame(string category)
    {
        if (_waitingPlayers.TryGetValue(category, out var opponentId))
        {
            var roomId = Guid.NewGuid().ToString();
            _waitingPlayers.Remove(category);

            await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
            await Groups.AddToGroupAsync(opponentId, roomId);

            await Clients.Group(roomId).SendAsync("GameStarted", roomId, "Player1");
        }
        else
        {
            _waitingPlayers[category] = Context.ConnectionId;
            await Clients.Caller.SendAsync("WaitingForOpponent");
        }
    }

    public async Task SendWord(string roomId, string word, string nextPlayerId)
    {
        await Clients.OthersInGroup(roomId).SendAsync("ReceiveWord", word, nextPlayerId);
    }
}
