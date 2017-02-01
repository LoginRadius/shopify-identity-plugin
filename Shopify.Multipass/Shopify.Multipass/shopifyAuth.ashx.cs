using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Configuration;
using System.Web.Helpers;
using System.Web.Script.Serialization;
using LoginRadausRaaS.SDK.Entity.Object;
using LoginRadius.SDK;
using LoginRadius.SDK.API;
using LoginRadius.SDK.Models.UserProfile;
using Newtonsoft.Json;
using Shopify.Multipass.Utility;

namespace Shopify.Multipass
{
    /// <summary>
    /// Summary description for shopifyAuth
    /// </summary>
    public class shopifyAuth : IHttpHandler
    {
        const String _storeName = "https://<Your Shopify Subdomain>.myshopify.com";
        const String _networkUser = "<Network UserName>";
        const String _networkPassword = "<Network Password>";
        public void ProcessRequest(HttpContext context)
        {
            var lrToken = context.Request.QueryString["lr-token"];
            var callback = context.Request.QueryString["callback"];
            var return_url = context.Request.QueryString["return_url"];

            if (!string.IsNullOrEmpty(lrToken) && !string.IsNullOrEmpty(lrToken))
            {
                var shopifyMultipassSecret = WebConfigurationManager.AppSettings["ShopifyMultipassSecret"];
                var shopifyShopDomain = WebConfigurationManager.AppSettings["ShopifyShopDomain"];

                var shopifyMultipassGenerator = new ShopifyMultipassGenerator(shopifyMultipassSecret, shopifyShopDomain);
                var loginRadiusClient = new LoginRadiusClient(lrToken);

                var userProfileAPI = new UserProfileAPI();
                var loginradiusProfile = loginRadiusClient.GetResponse<RaasUserprofile>(userProfileAPI);

                var redirectUrl = shopifyMultipassGenerator.GetMultipassRedirectUrl(new ShopifyProfile()
                {
                    email = loginradiusProfile.Email[0].Value,
                    created_at = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss+00:00"),
                    first_name = loginradiusProfile.FirstName,
                    last_name = loginradiusProfile.LastName,
                    return_to = return_url,
                    identifier = loginradiusProfile.Uid
                });

                var response = new MultipassResponse()
                {
                    RedirectUrl = redirectUrl
                };

                context.Response.ContentType = "application/javascript";
                context.Response.Write(callback + "(" + JsonConvert.SerializeObject(response) + ");");
            }
            else
            {
                context.Response.ContentType = "application/javascript";
                context.Response.Write("{ \"error\" : 1}");
            }
        }

        class MultipassResponse
        {
            public string RedirectUrl { get; set; }
        }

        private static CredentialCache GetCredential(string url)
        {
            // Pre Authentication for Shopify
            ServicePointManager.Expect100Continue = true;
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls
                                                   | SecurityProtocolType.Tls11
                                                   | SecurityProtocolType.Tls12
                                                   | SecurityProtocolType.Ssl3;
            var credentialCache = new CredentialCache();
            credentialCache.Add(new Uri(url), "Basic", new NetworkCredential(_networkUser, _networkPassword));
            return credentialCache;
        }

        private String GetCustomers(String email)
        {
            String url = String.Format(_storeName+"/admin/customers/search.json?query=email:{0}", email);
            var req = (HttpWebRequest)WebRequest.Create(url);
            req.Method = "GET";
            req.ContentType = "application/json";
            req.Credentials = GetCredential(url);
            req.PreAuthenticate = true;

            using (var resp = (HttpWebResponse)req.GetResponse())
            {
                
                if (resp.StatusCode != HttpStatusCode.OK)
                {
                    string message = String.Format("Call failed. Received HTTP {0}", resp.StatusCode);
                    throw new ApplicationException(message);
                }
                Encoding encode = System.Text.Encoding.GetEncoding("utf-8");
                using (var sr = new StreamReader(resp.GetResponseStream(), encode))
                {
                    return sr.ReadToEnd();
                }
            }
        }

        private String UpdateCustomerMutipassIdentifier(string customerId, string token)
        {
            String url = String.Format("{0}/admin/customers/{1}.json", _storeName, customerId);
            var req = (HttpWebRequest) WebRequest.Create(url);
            req.Method = "PUT";
            req.ContentType = "application/json";
            req.Credentials = GetCredential(url);
            req.PreAuthenticate = true;
            var serializer = new JavaScriptSerializer();
            string json = serializer.Serialize(new
            {
                customer = new
                {
                    multipass_identifier = token
                }
            });
            req.ContentLength = json.Length;
            using (var streamWriter = new StreamWriter(req.GetRequestStream()))
            {
                streamWriter.Write(json);
            }

            using (var resp = (HttpWebResponse) req.GetResponse())
            {
                if (resp.StatusCode != HttpStatusCode.OK)
                {
                    String message = String.Format("Call failed. Received HTTP {0}", resp.StatusCode);
                    throw new ApplicationException(message);
                }
                Encoding encode = System.Text.Encoding.GetEncoding("utf-8");
                using (var sr = new StreamReader(resp.GetResponseStream(), encode))
                {
                    return sr.ReadToEnd();
                }
            }
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}