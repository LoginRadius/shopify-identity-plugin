LoginRadius Shopify Multipass Integration
=====
------

This document goes over integrating LoginRadius into your Shopify site, this integration makes use of the LoginRadius JavaScript Interfaces along with the LoginRadius Hosted Plugin
feature, Please see below for instructions on setting up this integration.

##Multipass Configuration

Before you begin making changes on your Shopify site, you will need to configure Multipass. 

1. You will need to login to your Shopify account to configure Multipass under:

    Settings ➔ Checkout ➔ (scroll to "Customer accounts")

2. Set the configuration to "Accounts are required"

3. Under "Enable Multipass login" make sure you click "Enable Multipass" and write down the generated secret as you will need to provide it in your LoginRadius Admin Console.

4. Now that you have your Shopify configured for Multipass connections, you will need to configure Multipass in your LoginRadius Admin Console under:

    Platform Configuration ➔ Access Configuration ➔ SSO Connector ➔ (left panel) Shopify ➔ click on "Add"

Complete the fields as shown below:

- **Platform** From the drop-down choose "Shopify"

- **Store Name:** The name of your store

- **Store Url:** `https://<your shop name>.myshopify.com`

- **Store Login Url:** `https://<your shop name>.myshopify.com/account/login/`

- **Multipass Secret:** The Multipass Secret obtained from Shopify the Shopify Admin Console under:

	Settings ➔ Checkout ➔ (Enable Multipass login)

- **Mapping:** In this section you will be mapping the Shopify fields under "Key" with the LoginRadius fields under "Value". Please see the table below for a simple mapping:

|Key|Value| 
|---|---| 
|first_name|FirstName| 
|last_name|LastName| 
|email|Email[0].Value|

![enter image description here](https://apidocs.lrcontent.com/images/shopify_171485e91f741c7aff4.72443783.png "Shopify")

##Getting Started

This integration requires editing .liquid files, which can be done through the Shopify theme editor. Simply follow the instructions below:

1. Login to admin
2. Click on 'Online Store' on the left side menu
3. Click on 'Theme' in the left side menu
4. On the desired theme click 'Actions' and select the 'Edit code' option,
5. After opening the theme editor, follow the steps below to implement LoginRadius.

##Upload assets
First of all, extract the zip file you get from [LoginRadius Github](https://github.com/LoginRadius/shopify-identity-plugin) and upload the Javascript and CSS files into your theme:

**Contents:**
- raas-settings.js - The javascript file that handles the LoginRadius initializations and functionality. More details on how the various calls in this file work can be found [here](api/v2/user-registration/user-registration-getting-started).
- lr-raas-style.css - The default Styles applied to the LoginRadius Interfaces.
- register.liquid - A sample Register .liquid file.
- login.liquid - A sample Login .liquid file.


1. Extract 'Shopify.Assets', inside the folder there are several files you are going to use for your LoginRadius Shopify Implementation.
2. Expand 'Assets' option in your Shopify theme editor and click on 'Add a new assets' in the Shopify theme editor.
3. Select both files and upload.
4. If you are going to use the default social icon theme as well, you also need to upload two image files inside the same folder "iconsprite.svg" and "iconsprite32.png".

##Edit 'theme.liquid' file
In the left side theme editor menu, there is a theme file explorer, this expands the 'Layouts'
option, click on the 'theme.liquid' file.

##Add LoginRadius core JS file and theme CSS
Add the following tags just before the </head> (closing head tag) tag

```
{{ 'lr-raas-style.css' | asset_url | stylesheet_tag }}
{{ '//auth.lrcontent.com/v2/js/LoginRadiusV2.js' | script_tag }}
{{ '//code.jquery.com/jquery-latest.min.js' | script_tag }}
```

##Initialize the LoginRadius User Registration options
The LoginRadius User Registration interfaces require the following options: `apiKey`, `appName` and also an [SOTT](/api/v2/user-registration/sott) token (unless you prefer to use [Google ReCaptcha](/api/v1/user-registration/advanced-customization#googlerecaptcha10)), add the following script just before the </body> (closing body tag) and make sure to replace <API KEY> and <APP NAME> with the LoginRadius API KEY and Site Name respectively provided in your LoginRadius site settings page and <SOTT> with your SOTT token if you plan on using [SOTT](/api/v2/user-registration/sott) for registration.

```
<script type="text/javascript">
var raasoption = {};
raasoption.apiKey = <API KEY>;
raasoption.appName = <APP NAME>
raasoption.hashTemplate= true;
raasoption.sott = <SOTT>;
raasoption.verificationUrl = window.location;
raasoption.resetPasswordUrl = window.location;
var LRObject= new LoginRadiusV2(raasoption);
var lrshopifystore = <Name Of Your Shopify Store>
</script>
```
##Add LoginRadius User Registration Shopify extension library
Add the following tag just after the 'Options initialization script'

```
 {{ 'raas-settings.js' | asset_url | script_tag }}
```

##Add SSO code
For best practice with LoginRadius Single-Sign-On (SSO), simply add the following two code blocks to each page where Single Sign-On is required, since for most cases it needs to work on every page, we will add this to our theme.liquid file. The first code block is for the scenario when the user is not logged into Shopify but he is logged in from other SSO family sites. The second one is used after the user is logged into Shopify, but has been logged out from other SSO family sites. Put it just after the 'raassettings.
js' script tag from the above steps.

```
{% if customer %}
  <script type = "text/javascript">
    $(document).ready(function() {
        var check_options= {};
      check_options.onError = function(response) {
		// On Error
        // If user is not log in then this function will execute.        
                window.location = 'https://{{ shop.domain }}/account/logout';                
        };      
      LRObject.util.ready(function() {
      	LRObject.init("ssoNotLoginThenLogout", check_options);
      }); 
     $("a:contains('Log out')").on('click', function() {
        lrLogout('/account/logout');
        return false;
      });
    });
 </script>
{% else %}
  <script type = "text/javascript">
   $(document).ready(function() {
      var ssologin_options= {};
      ssologin_options.onSuccess = function(data) {
      // On Success
      //Write your custom code here
        if (data.isauthenticated && document.referrer != "https://checkout.shopify.com/"){
          lrLogout('/account/logout');
        }else if (data.isauthenticated) {
           exchangeMultipassToken(data.token);			     
          }
      };

      LRObject.util.ready(function() {
     	 LRObject.init("ssoLogin", ssologin_options);
      });
    });
 </script>
{% endif %}
```
##Login
Expand the templates option under directory 'Template', select 'customers/login.liquid' option, select all and then delete everything on this page.

**Important:** In this page you need to make sure jQuery is properly imported as it varies on different themes, if jQuery loads, perfect. If it does not, you can import the latest version manually by adding the following line at the top of your page

{{ '//code.jquery.com/jquery-latest.min.js' | script_tag }}

Then copy and paste the code from the file 'login.liquid' from the zip folder. This file contains the interface and control for all the LoginRadius User Registration modules, it contains side by side social and traditional login interfaces, a message span to show the message, link for 'forgetpassword', and handles for 'forget password' and 'email verification'.

##Registration
Expand the templates option and click on 'customers/register.liquid'. To implement the registration form on Shopify Register page select everything in the file and replace it with the file 'registration.liquid' in the zip folder.

It will generate the user registration form for you with validation logic. All the fields are customizable when the form is being submitted, a verification email will be sent out to the email address that has been just filled in. The user will be officially registered after the verification link has been clicked.

##Customizations

This implementation makes use of the [LoginRadius JavaScript Interface](/api/v2/user-registration/user-registration-getting-started), if you which to customize the look and feel or even make some functionality changes, please refer to our [LoginRadius JavaScript Interface](/api/v2/user-registration/user-registration-getting-started) documentation.

