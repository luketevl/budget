app.controller('HomeController', function($scope, $rootScope, $timeout, $mdToast, sendEmail){

	/**
	 * BEGIN OPTIONS
	 */
	$rootScope.email = 'tiaguinhor@gmail.com';
	var _hourValue = 100,
		_hourStaticPage = 2,
		_hourDynamicPage = 4,
		_hourResponsive = 8,
		_hourWorkPerDay = 2,
		_templateValue = 500,
		_responsiveValue = 500,
		_mvcValue = 300,
		_domainValue = 350,
		_maintenanceValue = 200;
	/**
	 * END OPTIONS
	 */

	var init = function(){
		$scope.totalValue = 0;
		$scope.totalHours = 0;
		$scope.totalDays = 0;

		$scope.pages = [];
		$scope.newPage = {};
		$scope.values = {};
		$scope.other = {};
		$scope.service = 'website';

		$scope.staticValue = parseFloat(_hourValue * _hourStaticPage);
		$scope.dynamicValue = parseFloat(_hourValue * _hourDynamicPage);

		$scope.responsiveValue = _responsiveValue;
		$scope.mvcValue = _mvcValue;
		$scope.domainValue = _domainValue;
		$scope.maintenanceValue = _maintenanceValue;

		$scope.typeLanguages = [
			{
				"abb": "pt",
				"title": "Portuguese"
			},
			{
				"abb": "en",
				"title": "English"
			}
		];

		//aguarda carregamento
		$timeout(function(){
			$scope.send = $rootScope.translate.sendButton;
		}, 0);
	};

	// fire on controller loaded
	init();

	// Função disparada sempre que o objeto $scope.values e $scope.other sofrer alterações
	$scope.$watch('[values, pages]', function(newValues, oldValues, scope){
		$scope.totalValue = 0;
		$scope.totalHours = 0;
		$scope.totalDays = 0;

		//reseta variaveis se for selecionado um novo tipo de empresa
		if(newValues[0].sizedCompany != oldValues[0].sizedCompany){
			var _businessValue = $scope.values.sizedCompany;
			$scope.other = {};
			$scope.values = {};
			$scope.typeSite = {};
			$scope.values.sizedCompany = _businessValue;

			//aguarda carregamento
			$timeout(function(){
				$scope.totalValue += parseFloat(_businessValue);
			}, 0);
		}

		//verifica todos os valores e soma
		angular.forEach(newValues[0], function(value, key){
			//desmonta valor e verifica se é estatico ou dinamico
			if(value !== undefined && value.split('-').length > 1){
				$scope.totalValue += parseFloat(value.split('-')[1]);

				//calcula horas
				if(value.split('-')[0] == 'static')
					$scope.totalHours += _hourStaticPage;
				else
					$scope.totalHours += _hourDynamicPage;
			}else
				$scope.totalValue += parseFloat(value);
		});

		//verifica todos os valores e soma
		angular.forEach(newValues[1], function(value, key){
			//desmonta valor e verifica se é estatico ou dinamico
			if(value.type !== undefined && value.type.split('-').length > 1){
				$scope.totalValue += parseFloat(value.type.split('-')[1]);

				//calcula horas
				if(value.type.split('-')[0] == 'static')
					$scope.totalHours += _hourStaticPage;
				else
					$scope.totalHours += _hourDynamicPage;
			}else
				$scope.totalValue += parseFloat(value.type);
		});

		//aguarda carregamento
		$timeout(function(){
			//verifica se responsivo esta selecionado
			if(newValues[0].mobile && newValues[0].mobile != 0)
				$scope.totalHours += _hourResponsive;

			$scope.totalDays = $scope.totalHours / _hourWorkPerDay;

			if(newValues[0].application)
				$scope.totalDays += 30;
			if(newValues[0].game)
				$scope.totalDays += 30;
		}, 0)
	}, true);

	//verifica o tipo de site e realiza as somas
	$scope.$watch('typeSite', function(newValue){
		var _businessValue = $scope.values.sizedCompany;
		$scope.totalDays = 0;
		$scope.totalValue = 0;

		//se o tipo de site for template, soma com valor estatico
		if(newValue == 'template'){
			$scope.other = {};
			$scope.values = {};
			$scope.values.sizedCompany = _businessValue;

			//aguarda carregamento
			$timeout(function(){
				$scope.totalDays = 3;
				$scope.totalValue = parseFloat(_businessValue) + parseFloat(_templateValue);
			}, 0);
		}

		//se pagina personalizada, soma somente o tipo de empresa
		if(newValue == 'custom')
			$scope.totalValue = parseFloat(_businessValue);
	});

	//reseta variaveis e seleciona servico
	$scope.selectService = function(service){
		$scope.values = {};
		$scope.other = {};
		$scope.service = service;

		//fix set value to 0
		$timeout(function(){
			$scope.totalValue = 0;
		}, 100);
	};

	//fecha popup
	$scope.closePopup = function(){
		$scope.close = true;
	};

	//altera idioma do site
	$scope.changeLanguage = function(lang){
		$rootScope.language = lang;
	};

	//insere novas paginas
	$scope.insertNewPage = function(newPage){
		if(newPage.title && newPage.description){
			$scope.newPage = {};

			newPage.type = (newPage.type === undefined || newPage.type == $rootScope.translate.staticTitle) ? 'static-' + $scope.staticValue : 'dynamic-' + $scope.dynamicValue;

			$scope.pages.push(newPage);
		}else{
			$mdToast.show(
				$mdToast.simple()
					.textContent('Necessário preencher os campos NOME e DESCRIÇÃO.')
					.position('top left')
					.hideDelay(3000)
			);
		}
	};

	//envia formulario
	$scope.submit = function(){
		if($scope.user){
			$scope.loading = true;
			$scope.send = $rootScope.translate.sendingButton;

			sendEmail.get($scope.totalValue, $scope.totalDays, $scope.values, $scope.other, $scope.user, $scope.user.email).success(function(callback){
				delete $scope.user;
				$scope.loading = false;
				$scope.form.$setPristine();
				$scope.form.$setUntouched();
				$scope.send = $rootScope.translate.sendButton;

				$mdToast.show(
					$mdToast.simple()
						.textContent(callback)
						.position('top left')
						.hideDelay(3000)
				);
			}).error(function(){
				$scope.loading = false;
				console.error('Ajax factory error.');
			});
		}else{
			$mdToast.show(
				$mdToast.simple()
					.textContent('Por favor, preencha os campos de envio.')
					.position('top left')
					.hideDelay(3000)
			);
		}
	}
});