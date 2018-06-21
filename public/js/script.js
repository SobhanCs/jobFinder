document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {edge: 'right', draggable: true});
  });

  // Or with jQuery

//   $(document).ready(function(){
//     $('.sidenav').sidenav();
//   });