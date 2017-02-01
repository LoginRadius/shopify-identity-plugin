using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Newtonsoft.Json;
using OpenSSL.Crypto;

namespace Shopify.Multipass.Utility
{
    public class ShopifyMultipassGenerator
    {
        private readonly string _shopifyMultipassSecret;
        private readonly string _shopifyShopDomain;

        /// <summary>
        /// Only constructure of ShopifyMultipassGenerator class
        /// </summary>
        /// <param name="shopifyMultipassSecret">Shopify multipass secret, get it from shopify dashboard</param>
        /// <param name="shopifyShopDomain">Shopify shop name ex. example..myshopify.com</param>
        public ShopifyMultipassGenerator(string shopifyMultipassSecret, string shopifyShopDomain)
        {
            _shopifyMultipassSecret = shopifyMultipassSecret;
            _shopifyShopDomain = shopifyShopDomain;
        }

        public string GetMultipassToken(ShopifyProfile profile)
        {
            //Generate encryption key and signature key by SHA 256
            var keys = new MessageDigestContext(MessageDigest.SHA256).Digest(Encoding.UTF8.GetBytes(_shopifyMultipassSecret));

            //First 16 bytes will be encryption key and last 16 bytes will be signature key
            ArraySegment<byte> encryptionKeyArraySegmenet = new ArraySegment<byte>(keys, 0, 16);
            ArraySegment<byte> signatureKeyArraySegmenet = new ArraySegment<byte>(keys, 16, 16);

            var encryptionKey = encryptionKeyArraySegmenet.ToArray();
            var signatureKey = signatureKeyArraySegmenet.ToArray();


            var dataString = JsonConvert.SerializeObject(profile);
            var dataBytes = Encoding.UTF8.GetBytes(dataString);

            //generate random 16 bytes for Init Vactor
            var iv = new byte[16];
            new RNGCryptoServiceProvider().GetBytes(iv);

            //Generate Cipher using AES-128-CBC algo and concat Init Vector with this.
            var cipher = Combine(iv, new CipherContext(Cipher.AES_128_CBC).Crypt(dataBytes, encryptionKey, iv, true));

            //Generate signature of Cipher
            HMACSHA256 hasher = new HMACSHA256(signatureKey);
            byte[] sing = hasher.ComputeHash(cipher);


            //append signature to cipher and convert it to URL safe base64 string
            var token = Convert.ToBase64String(Combine(cipher, sing)).Replace("+", "-").Replace("/", "_");

            return token;
        }

        /// <summary>
        /// Convert your data to multipass token and get redirect url for shopify mutipass
        /// </summary>
        /// <param name="data"></param>
        /// <returns></returns>
        public string GetMultipassRedirectUrl(ShopifyProfile data)
        {
            var token = GetMultipassToken(data);
            //build redirect url
            return string.Format("https://{0}/account/login/multipass/{1}", _shopifyShopDomain, token);
        }

        


        /// <summary>
        /// for merging two bytes arrays
        /// </summary>
        /// <param name="a1">First array</param>
        /// <param name="a2">Second array</param>
        /// <returns></returns>
        private byte[] Combine(byte[] a1, byte[] a2)
        {
            byte[] ret = new byte[a1.Length + a2.Length];
            Array.Copy(a1, 0, ret, 0, a1.Length);
            Array.Copy(a2, 0, ret, a1.Length, a2.Length);
            return ret;
        }
    }

    public class Address
    {
        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string address1 { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string city { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string country { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string first_name { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string last_name { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string phone { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string province { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string zip { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string province_code { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string country_code { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public bool @default { get; set; }
    }

    public class ShopifyProfile
    {
        public string email { get; set; }
        public string created_at { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string first_name { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string last_name { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string tag_string { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string identifier { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string remote_ip { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public string return_to { get; set; }

        [JsonProperty(NullValueHandling = NullValueHandling.Ignore)]
        public List<Address> addresses { get; set; }
    }
}