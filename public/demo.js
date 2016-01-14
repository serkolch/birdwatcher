$(document).ready(function(){

  $allBirds = $('#all-birds');
  $locBirds = $('#location-birds');

  $allBirds.on('click',function(){
    $('.sighted').remove();
    $.ajax({
      url: '/demo/birds',
      type: 'get',
      datatype: 'json'
    }).done(function(results){
      var template = Handlebars.compile($('#sighting-temp').html());
      results.forEach(function(result){
        $('body').append(template(result))
      })
    })
  })
})