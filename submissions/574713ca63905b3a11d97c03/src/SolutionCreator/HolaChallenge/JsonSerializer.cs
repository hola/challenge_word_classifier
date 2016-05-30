using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;

namespace HolaChallenge
{
	public class JsonSerializerMaster
	{
		public JsonSerializerSettings SerializerSettings { get; }

		public JsonSerializerMaster()
		{
			SerializerSettings = CreateSettings();
		}

		public T Deserialize<T>(string json) where T : class
		{
			return string.IsNullOrEmpty(json)
				? null
				: JsonConvert.DeserializeObject<T>(json, SerializerSettings);
		}

		public T Deserialize<T>(string json, EventHandler<ErrorEventArgs> onDeserializeError) where T : class
		{
			var settings = CreateSettings();
			settings.Error = onDeserializeError;
			return JsonConvert.DeserializeObject<T>(json, settings);
		}

		public T Deserialize<T>(JObject jObject)
		{
			using (var jsonReader = jObject.CreateReader())
			{
				var serializer = JsonSerializer.CreateDefault(SerializerSettings);
				return serializer.Deserialize<T>(jsonReader);
			}
		}

		public JObject DeserializeToJObject(string json)
		{
			return JObject.Parse(json);
		}

		public dynamic DeserializeToDynamic(string json)
		{
			return JObject.Parse(json);
		}

		public string Serialize(object model)
		{
			var result = JsonConvert.SerializeObject(model, Formatting.None, SerializerSettings);
			return result;
		}

		public string SerializeUserFriendly(object model)
		{
			var result = JsonConvert.SerializeObject(model, Formatting.Indented, SerializerSettings);
			return result;
		}

		public JObject SerializeToJObject(object model)
		{
			return JObject.FromObject(model);
		}

		public JsonSerializerSettings CreateSettings()
		{
			var settings = new JsonSerializerSettings
			{
				DateFormatHandling = DateFormatHandling.IsoDateFormat,
				DefaultValueHandling = DefaultValueHandling.Include,
				TypeNameHandling = TypeNameHandling.Auto,
				NullValueHandling = NullValueHandling.Ignore,
				ContractResolver = new CamelCasePropertyNamesContractResolver()
			};

			settings.Converters.Add(new StringEnumConverter());

			return settings;
		}
	}
}
