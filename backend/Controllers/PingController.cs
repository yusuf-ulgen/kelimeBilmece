using Microsoft.AspNetCore.Mvc;
using System;

namespace Caterpillar.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PingController : ControllerBase
{
    [HttpGet("/api/ping")]
    [HttpHead("/api/ping")]
    public IActionResult Ping()
    {
        return Ok(new { message = "pong", timestamp = DateTime.UtcNow });
    }
}
