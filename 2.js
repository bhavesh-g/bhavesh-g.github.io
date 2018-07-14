$("button").click(function(){

	var x=document.getElementById('input').value;
		var url='https://maps.googleapis.com/maps/api/geocode/json?address='+x;
    $.get(url, function(data, status){
        
      
        document.getElementById('Lat').value=data.results[0].geometry.location.lat;

        document.getElementById('lng').value=data.results[0].geometry.location.lng;

    });
});