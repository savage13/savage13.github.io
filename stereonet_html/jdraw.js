

var skynet;

function hide_input() {
    var inputs = [ "#plane_pole_input", "#add_input", "#small_circle_input",
                   "#mouse_input", "#text_input"];
    for(var i in inputs ) {
        $(inputs[i]).hide();
    }
}

$(document).ready( function(){

        // Setup the Tab Interface
        $("#tabs").tabs();
        
        hide_input();
        $("#plane_pole_input").show();
        $("#add_input").show();
        $("#object_type").val("Plane");

	skynet = new Stereonet("#net");

        // Cause a return to add a plane to the list
        $("#object_type").change( function() {
                var type = $("#object_type").val();
                add_plane_mouse(false);
                hide_input();
                if(type == "Plane" || type == "Pole") {
                    $("#plane_pole_input").show();
                    $("#add_input").show();
                }
                if(type == "Small Circle") {
                    $("#small_circle_input").show();
                    $("#add_input").show();
                }
                if(type == "Pole (Mouse)") {
                    $("#mouse_input").show();
                    add_plane_mouse(true);
                }
                if(type == "Text Input") {
                    $("#text_input").show();
                    $("#add_input").show();
                }
            });
        //$("#object_type").change("Plane");
        $("#add").click( function() {
                var type = $("#object_type").val();
                if(type == "Plane") {
                    add_plane('plane');
                }
                if(type == "Pole") {
                    add_plane('pole');
                }
                if(type == "Small Circle") {
                    add_small_circle();
                }
                if(type == "Text Input") {
                    parse_textdata();
                }
            });

	$('.input').keydown(function(e){
		if (e.keyCode == 13) {
                    if( $("#object_type").val() != "Text Input" ) {
                        $("#add").click();
                        return false;
                    }
                    return true;
		}
	    });
        // Cancel Mouse Input Button
        $("#mouse_cancel").click( function() { 
                $("#object_type").val("Plane").change(); 
            });

        // Return to 0 Button
	$("#zero").click( function()         { skynet.rotate(0.0);   });
	$("#contour").click( function()         { skynet.contour();     });
        // Save Button
	$("#save").click( function()         { skynet.save("#dump"); });

        // Reset Options 
        $("#reset").click( function() {
                $("#plane_width").val(2);
                $("#pole_size").val(5);
                $("#reference_width").val(0.3);
                $("#reference_spacing").val(10);
                skynet.change_property(	$("#reference_width").val() * 1.0,
                                        $("#reference_spacing").val() * 1.0,
                                        $("#pole_size").val() * 1.0,
                                        $("#plane_width").val() * 1.0
                                        );
            });
    
    
        // Handle Plane Delete Events
        $(".delete").live('click', function(event) {
                var id = $(this).attr("id");
                $(this).parent().parent().remove();
                skynet.remove(id);
                update_zebra();
                return false;
	    });
    
        // Handle Plane Type Change Events
        $(".poleplane").live('click', function(event) {
                var id = $(this).attr("id");
                $(".pp" + id).toggle();
                skynet.change_plane_type(id);
                return false;
	    });
    
        // Handle Changes in Drawing Options
	$(".drawing_options").change(function() { 
            skynet.change_property(	$("#reference_width").val() * 1.0,
                                    $("#reference_spacing").val() * 1.0,
                                    $("#pole_size").val() * 1.0,
                                    $("#plane_width").val() * 1.0,
                                    $("#show_original_net").val()
                                    );
            
	    });
	$("input[name='projection']").change(function() {
            skynet.change_projection_type();
	    });
    
    });


function angle_show(angle) {
    // Constrain the angle to ( -PI <= angle <= PI )
    while(angle < -Math.PI) { angle += 2*Math.PI; }
    while(angle > Math.PI)  { angle -= 2*Math.PI; }
    angle = angle * 180.0 / Math.PI ;
    $("#angle").html("Angle: " + angle.toFixed(2));
}


function addTableRow(jQtable, id, d){
    jQtable.each(function(){
        var $table = $(this);
        // Number of td's in the last table row
        var n = $('tr:last td', this).length;
        var tds = '<tr id="' + id + '">';
        for(var i = 0; i < n; i++){
            tds += '<td>' + d[i] + '</td>';
        }
        tds += '</tr>';
        if($('tbody', this).length > 0){
            $('tbody', this).append(tds);
        } else {
            $(this).append(tds);
        }
    });
}

function x_button(id) {
    return '<a href="#" class="delete" id="'+id+'" >x</a>';
}

// Pole or Plane Link
function pp(id, type) {
    var str = '<a href="#" class="poleplane" id="'+ id + '">';
    if(type == "plane") {
	str += '<span class="pp'+id+'" >plane</span>' +
            '<span class="pp'+id+'" style="display: none;">pole</span>'
            +'</a>';
    } else {
	str += '<span class="pp'+id+'" style="display: none;">plane</span>' +
            '<span class=="pp'+id+'" >pole</span>'
            +'</a>';
    }
    return str;
}

// Color Picker
function picker(id) {
    return '<div class="colorpick" id="colorpick_' + id  + '">' +
	'     <div class="color_value" id="color_' + id  + '"></div>' +
	'</div>';
}

// Update the stripes of the data table
function update_zebra() {
    $(".zebra tr").removeClass("ui-state-highlight");
    $(".zebra tr:odd").addClass("ui-state-highlight");    
}

// Turn on the Mouse Pole Addition
function add_plane_mouse( value ) {
    skynet.mouse_add = value;
}


function parse_textdata() {
    var lines = $("#textdata").val().split("\n");
    $("#debug").html("");
    for (i in lines) {
        var z  = parsePlane(lines[i]);
        if(z.error) {
            $("#debug").append(z.error + '<br/>');
        } else {
            if(z.type == "plane" || z.type == "pole") {
                add_plane(z);
            }
            if(z.type == "smallcircle") {
                add_small_circle( z );
            }
            if(z.type == "angle") {
                skynet.rotate( z.angle * Math.PI/180.0);
            }
        }
    }
}

function colorpicker_color(n, hex_color) {
    $("#colorpick_" + n ).ColorPicker({
            color: colorNameToHex(hex_color),
		onChange: function (hsb, hex, rgb) {
		    $('#color_'+ n).css('backgroundColor', '#' + hex);
		    skynet.change_color(n, hex);
                },
	    });
    $('#color_'+ n).css('backgroundColor', '#' + colorNameToHex(hex_color));
}

function add_small_circle( o ) {
    if(o == undefined) {
        o = {};
    }
    if(o.color == undefined) {
        o.color = "black";
    }
    if(o.angle == undefined) {
        o.angle = $("#sc_angle").val() * 1.0;
    }
    if(o.rotation == undefined) {
        o.rotation = -skynet.angle * 180.0 / Math.PI;
        o.rotation = o.rotation.toFixed(2) * 1.0;
    }
    if(o.type == undefined) {
        debug('creating new small circle');
        o = new SmallCircle(o);
    }
    var n = skynet.add( o );

    if(n) {
        addTableRow($("#data"), n, [ x_button(n), o.angle, o.rotation,
                                     "small circle", "small circle",
                                     picker(n) ]);
        colorpicker_color(n, o.style.color);
	update_zebra();
    }
    return n;
}

function add_plane( o ) {
    var type = o;
    if(o == undefined || o == "plane" || o == "pole") {
        o = {};
    }
    if(type == "pole" || type == "plane") {
        o.input = type;
    }
    if(o.color == undefined)  { 
        o.color = "black"; 
    }
    if(o.strike == undefined) { 
        o.strike = $("#strike").val() * 1.0; 
    }
    if(o.dip == undefined)    { 
        o.dip    = $("#dip").val() * 1.0;  
    }
    if(o.type == undefined)   { 
        o = new Plane( o ) ;  
    }

    var n = skynet.add( o );
    if(n) {
        addTableRow($("#data"), n, [ x_button(n), o.strike, o.dip, 
                                     pp(n, o.type), o.type, 
                                     picker(n) ]);
        colorpicker_color(n, o.style.color);
	update_zebra();
    }
    return n;
}

