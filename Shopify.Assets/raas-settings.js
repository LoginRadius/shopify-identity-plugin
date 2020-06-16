LRObject.$hooks.register('startProcess', function () {
  jQuery('#fade').show();
  $("#loading-spinner").show();
}
);


LRObject.$hooks.register('endProcess', function () {
  jQuery('#fade').hide();
  $("#loading-spinner").hide();
}
);

function setErrorMessage(msg) {
  jQuery("#lr-raas-message").show().addClass("loginradius-raas-error-message").text(msg);
  visibleLoadingSpinner(false);

}

function setMessage(msg) {
  jQuery("#lr-raas-message").show().addClass("loginradius-raas-success-message").text(msg);
  visibleLoadingSpinner(false);
}

jQuery(window).load(function () {
  jQuery('.lr_fade').hide();   
});

function backtoLogin() {
  var logout_options = {};
  logout_options.onSuccess = function (response) {
    // On Success
    //Write your custom code here
    window.lr_raas_settings.sociallogin = 'false';
    $("#lr-social-traditional-login").show();
    $("#interfacecontainerdiv").show();
    $("#no-email-container").hide();
  };
}

jQuery(".site_login_btn").click(function () {
  // showform('lrLogin')
  jQuery(".account-modal-overlay").show();

  // Manipulate LR Form
  jQuery('.content-loginradius-raas-emailid label').text('Email');

  if (!jQuery('.btn-register').length) {
    var newAccountBtn = '<a class="btn-register" style="float:left;" >New Account</a>';
    jQuery('#login-container form').append(newAccountBtn);
  }

  if (!jQuery('#register-interfacecontainer').length) {
    jQuery('#login-interfacecontainer')
      .clone(true)
      .attr('id', 'register-interfacecontainer')
      .appendTo("#social-registration-interface");
  }
});

jQuery(".account-modal-overlay .close-btn img").click(function () {
  jQuery(".account-modal-overlay").hide();
});


LRObject.util.ready(function () {

  window.lr_raas_settings = window.lr_raas_settings || {};

  if (window.lr_raas_settings.registration) {

    registration_options.container = window.lr_raas_settings.registration_containerid;
    LRObject.util.ready(function () {
      LRObject.init("registration", registration_options);
    })

  }

  if (window.lr_raas_settings.login) {



    login_options.container = window.lr_raas_settings.login_containerid;
    LRObject.util.ready(function () {
      LRObject.init("login", login_options);
    });



  }

  if (window.lr_raas_settings.forgotpassword) {

    forgotpassword_options.container = window.lr_raas_settings.forgotpassword_containerid;
    LRObject.init("forgotPassword", forgotpassword_options);


  }

  if (window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=reset') > -1) {
    $("#lr-raas-login").hide();
    $("#login-container").hide();
    $("#lr-social-traditional-login").hide();
    $("#resetpassword-container").show();


    if (window.lr_raas_settings.resetpassword) {

      resetpassword_options.container = window.lr_raas_settings.resetpassword_containerid;

      LRObject.init("resetPassword", resetpassword_options);

    }
  }

  if (window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=emailverification') > -1) {


    $("#registration-container").hide();
    $("#lr-raas-message").css("display", "block");
    LRObject.init("verifyEmail", verifyemail_options);

  }


  if (window.lr_raas_settings.sociallogin) {
    raasoption.hashTemplate = true;


    var custom_interface_option = {};
    custom_interface_option.templateName = 'loginradiuscustom_tmpl';
    LRObject.util.ready(function () {
      LRObject.customInterface(window.lr_raas_settings.sociallogin_interfaceid, custom_interface_option);
    });


    sl_options.container = window.lr_raas_settings.sociallogin_containerid;
    LRObject.util.ready(function () {
      LRObject.init('socialLogin', sl_options);
    });

  }

  LRObject.$hooks.register('socialLoginFormRender', function () {
    //on social login form render
    $("#lr-social-traditional-login").hide();
    $("#interfacecontainerdiv").hide();
    $("#no-email-container").show();
    $("#no-email-container").prepend("<h4> We couldn't find your email address, please fill in the form below </h4>");
    $("#no-email-container").append('    <a onclick="javascript: backtoLogin();" class="backto-login-btn" >Go back to login</a>');


  });

  var maxYear = new Date().getFullYear();
  var minYear = maxYear - 100;
  $('body').on('focus', ".loginradius-raas-birthdate", function () {
    $('.loginradius-raas-birthdate').datepicker({
      dateFormat: 'mm-dd-yy',
      maxDate: new Date(),
      minDate: "-100y",
      changeMonth: true,
      changeYear: true,
      yearRange: (minYear + ":" + maxYear)
    });
  });

  if (getParameterByName("vtype") && getParameterByName("vtype") == "reset" && getParameterByName("vtoken")) {
    jQuery(".account-modal-overlay").show();
    // showform('lrReset');


  }
  if (getParameterByName("vtype") && getParameterByName("vtype") == "emailverification" && getParameterByName("vtoken")) {
    jQuery(".account-modal-overlay").show();
    // showform('lrLogin');
  }

});
function hideMessage() {
  jQuery("#lr-raas-message").hide();
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function exchangeMultipassToken(token) {
  var apiUrl = "https://cloud-api.loginradius.com/sso/shopify/api/token?store=" + lrshopifystore
  if (getParameterByName("checkout_url")) {
    apiUrl = apiUrl + "&return_url=" + getParameterByName("checkout_url");
  }

  $.ajax({
    url: apiUrl,
    type: 'GET',
    dataType: 'json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'X-LoginRadius-ApiKey': raasoption.apiKey
    },
    success: function (response) {
      console.log(response);
      window.location = response.url;
    }
  });
}


// If found an active session is found, goto the callback function
var ssologin_options = {};
ssologin_options.onSuccess = function (response) {
  // On Success
  //Write your custom code here
  console.log(response);
};

LRObject.util.ready(function () {
  LRObject.init("ssoLogin", ssologin_options);
});


//Login
var login_options = {};
login_options.onSuccess = function (response) {
  //On Success

    exchangeMultipassToken(response.access_token);
 
}
login_options.onError = function (errors) {
  //On Errors
    setErrorMessage(errors[0].Message);
  console.log(errors);
};

// Logout Action
var logout_options = {};
logout_options.onSuccess = function (response) {
  // On Success
  //Write your custom code here
  console.log("Session not found");
  window.location = '/account/logout';
};


var forgotpassword_options = {};

forgotpassword_options.onSuccess = function (response) {
  // On Success
   
   if(response.IsPosted == true && typeof response.Data !== 'undefined' && response.Data!==null)
            {
                setMessage("OTP has been sent to your phone number.");                  
            }else if(LRObject.options.otpEmailVerification==true && typeof response.Data==='undefined')
            {
                setMessage("OTP has been sent to your email address.");              
            } else if (response.IsPosted == true && typeof (response.Data) === "object") {				
                if(jQuery('form[name="loginradius-resetpassword"]').length > 0) {
                  setMessage("Password has been reset successfully.");  
                    $("#lr-raas-login").show();
                    $("#login-container").show();
                    $("#lr-social-traditional-login").show();
                    $("#lr-raas-forgotpassword").hide();
                }           
            }else if (response.IsPosted == true && typeof (response.Data) === "undefined") {
                if(jQuery('form[name="loginradius-resetpassword"]').length > 0) {                    
                  setMessage("Password has been reset successfully.");  
                   $("#lr-raas-login").show();
                    $("#login-container").show();
                    $("#lr-social-traditional-login").show();
                    $("#lr-raas-forgotpassword").hide();
                } else {
                  setMessage("Password reset information sent to your provided email id, check email for further instructions");
                   
                }
            }
 
};
forgotpassword_options.onError = function (errors) {
  // On Errors
  
        if (errors[0].Description != null) {
                setErrorMessage(errors[0].Description);
            } else if (errors[0] != null) {
                setErrorMessage(errors[0].Message);
            }
}


var verifyemail_options = {};
verifyemail_options.onSuccess = function (response) {
  // On Success
  $("#lr-social-traditional-login").hide();
  $("#interfacecontainerdiv").hide();
  $("#no-email-container").show();
  $("#no-email-container h4").hide();

  console.log(response);
  setMessage("Email verified, now you can login");
};
verifyemail_options.onError = function (errors) {
  // On Errors
  $("#lr-social-traditional-login").hide();
  $("#interfacecontainerdiv").hide();
  $("#redirectologin").show();
  console.log(errors);
  setErrorMessage(errors[0].Message);
}

var resetpassword_options = {};

resetpassword_options.onSuccess = function (response) {
  // On Success

  document.getElementsByName("loginradius-resetpassword")[0].reset();
  console.log(response);
  setMessage("Password reset successfully, now you can login");
  $("#lr-raas-login").show();
  $("#login-container").show();
  $("#lr-social-traditional-login").show();
  $("#resetpassword-container").hide();
};
resetpassword_options.onError = function (errors) {
  // On Errors
  console.log(errors);
    if (errors[0].Description != null) {
        setErrorMessage(errors[0].Description);
    } else if (errors[0] != null) {
        setErrorMessage(errors[0].Message);
    }
}


var registration_options = {}
registration_options.onSuccess = function (response) {
  //On Success
  console.log(response);
  var optionalemailverification = '';
            var disableemailverification = '';
            if (typeof LRObject.options.optionalEmailVerification != 'undefined') {
                optionalemailverification = LRObject.options.optionalEmailVerification;
            }
            if (typeof LRObject.options.disabledEmailVerification != 'undefined') {
                disableemailverification = LRObject.options.disabledEmailVerification;
            }                
            if (response.IsPosted && response.Data == null) {
                if ((typeof (optionalemailverification) == 'undefined' || optionalemailverification !== true) && (typeof (disableemailverification) == 'undefined' || disableemailverification !== true)) {
                    setMessage("Email for verification has been sent to your provided email, please check email for further instructions");
                    
                }
            }else if (response.access_token != null && response.access_token != "") {
                 exchangeMultipassToken(response.access_token);
              
            } else if(response.IsPosted && typeof response.Data !== 'undefined' && response.Data!==null && typeof response.Data.Sid !== 'undefined')
            {
                setMessage("OTP has been sent to your phone number.");
            } else if(LRObject.options.otpEmailVerification==true && response.Data==null) {
                setMessage("OTP has been sent to your email address.");           
            } else {
                 setMessage("Email for verification has been sent to your provided email, please check email for further instructions");
            }  
 
};
registration_options.onError = function (errors) {
  //On Errors
 console.log(errors);
  setErrorMessage(errors[0].Message);
  
};

var sl_options = {};
sl_options.onSuccess = function (response) {
  //On Success
  //Here you get the access token
  console.log(response);
  if (response.IsPosted) {
    //document.getElementsByName("loginradius-socialRegistration")[0].reset();
    setMessage("Email for verification has been sent to your provided email, please check email for further instructions");
    jQuery('#interfacecontainerdiv').hide();
  } else {
    exchangeMultipassToken(response.access_token);    
  }
};
sl_options.onError = function (errors) {
  //On Errors
  if (window.isSSORedirectedToken) {
    LRObject.init("logout", logout_options);

  }
  else {
    setErrorMessage(errors[0].Message);
  }
};




//Account Linking
var la_options = {};
la_options.container = "interfacecontainerdiv";
la_options.templateName = 'loginradiuscustom_tmpl_link';
la_options.onSuccess = function (response) {
  // On Success
  console.log(response);
};
la_options.onError = function (errors) {
  // On Errors
  console.log(errors);
}



function lrLogout() {
  LRObject.init("logout", logout_options);
  console.log("logout");
};

$(document).ready(function () {

  if (window.location.pathname == "/logout/account") {
    console.log("on the page");
    LRObject.init("logout", logout_options);
    console.log("logout");
  }
});



function visibleLoadingSpinner(isvisible) {
  if (isvisible) {
    $("#loading-spinner").show();
  }
  else {
    $("#loading-spinner").hide();
  }
};
