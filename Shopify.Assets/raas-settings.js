LoginRadiusRaaS.$hooks.setProcessHook(function () {
    // console.log('animation');
  	// jQuery('body').append('');
  	jQuery('.lr_fade').show();
}, function () {
//   	jQuery('.lr_fade').hide();
});

jQuery(window).load(function() {
  	jQuery('.lr_fade').hide();
});

function backtoLogin() {
	$SL.util.jsonpCall('//' + LoginRadiusSSO.appName + '.hub.loginradius.com/ssologin/logout', function (data) {
      if (data.ok) {
        window.lr_raas_settings.sociallogin = 'false';
        $("#lr-social-traditional-login").show();
        $("#interfacecontainerdiv").show();
        $("#no-email-container").hide();
      }
    });
}


$SL.util.ready(function() {
	raasoption.inFormvalidationMessage  = true;
	raasoption.V2Recaptcha = true;
	raasoption.forgotPasswordUrl = window.location.href;
	raasoption.emailVerificationUrl = window.location.href;
	
	window.lr_raas_settings = window.lr_raas_settings || {};
	
	if(window.lr_raas_settings.registration){

		LoginRadiusRaaS.init(raasoption, 'registration', function(response) {
			setMessage("Email for verification has been sent to your provided email id, check email for further instructions");
		}, function(errors) {
			setErrorMessage(errors[0].message);
		}, window.lr_raas_settings.registration_containerid);
	}
	
	if(window.lr_raas_settings.login){
		LoginRadiusRaaS.init(raasoption, 'login', function(response) {
			exchangeMultipassToken(response.access_token, function(data){
				window.location = data.RedirectUrl;
			});
		}, function(errors) {
			setErrorMessage(errors[0].message);
		}, window.lr_raas_settings.login_containerid);
	}
	
	if(window.lr_raas_settings.forgotpassword){
		LoginRadiusRaaS.init(raasoption, 'forgotpassword', function(response) {
			setMessage("Password reset information sent to your provided email id, check email for further instructions");
		}, function(errors) {
			setErrorMessage(errors[0].message);
		}, window.lr_raas_settings.forgotpassword_containerid);
	}
	
	if(window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=reset') > -1){
		$("#lr-raas-login").hide();
		$("#resetpassword-container").show();
		if(window.lr_raas_settings.resetpassword){
			LoginRadiusRaaS.init(raasoption, 'resetpassword', function(response) {
				setMessage("Password reset successfully, now you can login");
				
				$("#lr-raas-login").show();
				$("#resetpassword-container").hide();
			}, function(errors) {
				 setErrorMessage(errors[0].message);
			}, window.lr_raas_settings.resetpassword_containerid);
		}
	}
	
	if(window.location.search.indexOf('vtoken') > -1 && window.location.search.indexOf('vtype=emailverification') > -1){
		LoginRadiusRaaS.init(raasoption, 'emailverification', function (response) {
			setMessage("Email verified, now you can login");
		}, function (errors) {
			setErrorMessage(errors[0].message);
		});
	}
	
	

	
	if(window.lr_raas_settings.sociallogin){
		raasoption.templatename = "loginradiuscustom_tmpl";
		raasoption.hashTemplate = true;
		LoginRadiusRaaS.CustomInterface(window.lr_raas_settings.sociallogin_interfaceid, raasoption);
	
		LoginRadiusRaaS.init(raasoption, 'sociallogin', function (response) {
            if (response.isPosted) {
              setMessage("Password reset information sent to your provided email id, check email for further instructions");
            }else{
              exchangeMultipassToken(response, function(data){
                  window.location = data.RedirectUrl;
              });
            }
		}, function (errors) {
          
          if(window.isSSORedirectedToken){
            LoginRadiusSSO.logout(function(){
            isSSORedirectedToken = false;
            });
          }else{
            setErrorMessage(errors[0].message);
          }
			
		}, window.lr_raas_settings.sociallogin_containerid);
	}
	
	LoginRadiusRaaS.$hooks.socialLogin.onFormRender = function() {
  		$("#lr-social-traditional-login").hide();
		$("#interfacecontainerdiv").hide();
      	$("#no-email-container").show();
	};
	
	function setErrorMessage(msg){
		jQuery("#lr-raas-message").show().addClass("loginradius-raas-error-message").text(msg);
	}
	
	function setMessage(msg){
		jQuery("#lr-raas-message").show().addClass("loginradius-raas-success-message").text(msg);
	}
	
	var maxYear = new Date().getFullYear();
    var minYear = maxYear - 100;
	$('body').on('focus', ".loginradius-raas-birthdate", function () {
        $('.loginradius-raas-birthdate').datepicker({
            dateFormat: 'mm-dd-yy',
            maxDate:  new Date(),
            minDate: "-100y",
            changeMonth: true,
            changeYear: true,
            yearRange: (minYear + ":" + maxYear)
        });
    });
	
	
	function exchangeMultipassToken(lrtoken, handle){

		
        var url = "https://cloud-api.loginradius.com/sso/shopify/api/token?apikey="+raasoption.apikey+"&store="+{store}+"&access_token= " +lrtoken
		if(getParameterByName("checkout_url")){
			url = url + "&return_url="+getParameterByName("checkout_url");	
		}
		
		$SL.util.jsonpCall(url,handle);
	}
	
	function getParameterByName(name) {
		name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
			results = regex.exec(location.search);
		return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}
	
});