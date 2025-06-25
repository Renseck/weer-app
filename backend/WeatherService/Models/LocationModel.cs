namespace WeatherService.Models
{
    public class Location
    {
        public int Id { get; set; }
        public int Postcode { get; set; }
        public string Woonplaats { get; set; }
        public string Gemeente { get; set; }
        public string Provincie { get; set; }
        public decimal Lat { get; set; }
        public decimal Lon { get; set; }
        public string Soort{ get; set; }
    }
}