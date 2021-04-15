App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,


  init: function () {
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function () {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function () {

    $.getJSON("YasToken.json", function (YasToken) {
      App.contracts.YasToken = TruffleContract(YasToken);
      App.contracts.YasToken.setProvider(App.web3Provider);
      App.contracts.YasToken.deployed().then(function (YasToken) {
        console.log("Yas Token Address:", YasToken.address);
      });

      App.listenForEvents();
      return App.render();
    });

  },

  // Listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.YasToken.deployed().then(function (instance) {
      instance.Transfer({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function (error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    $('#friendBalance').html("");
    // Load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.YasToken.deployed().then(function (instance) {
      TokenInstance = instance;
      return TokenInstance.balanceOf(App.account);
    }).then(function (balance) {
      $('#accountBalance').html("Your Balance: " + balance + " YAS");

      App.loading = false;
      loader.hide();
      content.show();
    })
  },

  checkBalance: function () {
    $('#content').hide();
    $('#loader').show();
    var address = $('#address1').val();
    App.contracts.YasToken.deployed().then(function (instance) {
      TokenInstance = instance;
      return TokenInstance.balanceOf(address);

    }).then(function (balance) {
      console.log(address);
      $('#friendBalance').html("The account " + address + " has " + balance + " YAS");
      if (address == "") {
        $('#friendBalance').html("");
      }
      $('form').trigger('reset') 
      
      $('#loader').hide();
      $('#content').show();
    });
  },

  sendToken: function () {
    $('#content').hide();
    $('#loader').show();
    var address = $('#address2').val();
    var amount = $('#amount').val();
    console.log(address, amount);
    App.contracts.YasToken.deployed().then(function (instance) {
      return instance.transfer(address, amount, { from: App.account });

    }).then(function (result) {
      console.log("paymet succesfull");
      
      $('form').trigger('reset') 
      // Wait for Transfer event
      
    });
  }
}



$(function () {
  $(window).load(function () {
    App.init();
  })
});