$(function () {
  $('#langOpt').multiselect({
    columns: 1,
    placeholder: 'Select Languages',
    search: true,
    selectAll: true
});
  $("#stuff").keyup(function(event){

    var maxCharInALine = 21;
    var tempString=this.value;
    var tempLength=tempString.length;
    var maxLineLength =(tempString.lastIndexOf("\n") ? tempString.lastIndexOf("\n")+maxCharInALine: maxCharInALine);
       if(tempLength >= maxLineLength){
           if(tempString.lastIndexOf(" ")>=0){
                var lastString =  tempString.substr(tempString.lastIndexOf(" ")+1);
                var stringL =(tempString.substr(0,tempString.lastIndexOf(" "))+"\n"+lastString);
          
            }else{
                var lastString =  tempString.substr(maxLineLength);
                 var stringL =(tempString.substr(0,maxLineLength)+"\n"+lastString);
            }
        
        
         $("#stuff").val(stringL);
          
       }
    
    });

  
});

function openCity(evt, cityName) {
    debugger;
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
  }

