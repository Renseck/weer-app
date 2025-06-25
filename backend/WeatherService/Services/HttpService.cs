using System.Text.Json;

namespace WeatherService.Services
{
    public interface IHttpClientService
    {
        Task<T> GetJsonAsync<T>(string url);
    }
    public class HttpClientService : IHttpClientService
    {
        private readonly HttpClient _httpClient;

        /* ====================================================================================== */
        public HttpClientService()
        {
            _httpClient = new HttpClient();
        }

        /* ====================================================================================== */
        public async Task<T> GetJsonAsync<T>(string url)
        {
            try
            {
                string jsonString = await _httpClient.GetStringAsync(url);
                return JsonSerializer.Deserialize<T>(jsonString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

            }
            catch (HttpRequestException ex)
            {
                throw new Exception($"Error fetching data from {url}: {ex.Message}", ex);
            }
            catch (JsonException ex)
            {
                throw new Exception($"Error parsing JSON from {url}: {ex.Message}", ex);
            }
        }
    }
}