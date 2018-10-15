

function cumptrapz(y, x, x0) {
    var z = [];
    z.push(0.0)
    for(var i = 0; i < y.length-1; i++) {
        zi = zi + d/2.0 * (y[i] + y[i+1])
        z.push(zi);
    }
    return z;
}

function series_func(σ, E1, E2, η, ε) {
    var dt = ε[1][0]-ε[0][0];
    var C = η/(E1+E2);
    var A = (E2 * E1) / (E1+E2);
    var B = ( η * E1) / (E1+E2);
    var K0 = 0.0;
    var K1 = 0.0;
    var k = 0.0;
    ε[0][1] = 0.0;
    for(var i = 1; i < σ.length; i++) {
        var t = σ[i][0];
        var dσdt = (σ[i][1] - σ[i-1][1])/dt;
        var σ1 = σ[i][1] + dσdt * C;
        K0 = K1
        K1 = σ1/B * Math.exp(A*t/B);
        k = k + (K1 + K0) * dt/2.0;
        ε[i][1] = Math.exp(-A*t/B) * k;
    }
}

function series2_func(σ, E1, E2, η, ε) {
    var dt = ε[1][0]-ε[0][0];
    //var C = η/(E1+E2);
    var A = (E2 * E1);
    var B = η * (E1 + E2);
    var K0 = 0.0;
    var K1 = 0.0;
    var k = 0.0;
    ε[0][1] = 0.0;
    for(var i = 1; i < σ.length; i++) {
        K0 = K1
        var t = σ[i][0];
        var dσdt = (σ[i][1] - σ[i-1][1])/dt;
        var σ1 = E2 * σ[i][1] + η * dσdt;
        K1 = σ1 * Math.exp(A*t/B);
        k = k + (K1 + K0) * dt/2.0;
        ε[i][1] = Math.exp(-A*t/B) * k / B;
    }
}

function viscous_func(σ, η, ε) {
    var dt = ε[1][0]-ε[0][0];
    ε[0][1] = 0.0;
    for(var i = 1; i < ε.length; i++) {
        ε[i][1] = ε[i-1][1] + (σ[i][1] / η) * dt/2.0;
    }
}

function maxwell_func(σ, E, η, ε) {
    var dt = ε[1][0]-ε[0][0];
    ε[0][1] = 0.0;
    for(var i = 1; i < ε.length; i++) {
        dσdt = (σ[i][1]-σ[i-1][1])/dt;
        ε[i][1] = ε[i-1][1] + (σ[i][1]/η + 1.0/E * dσdt) * dt/2;
    }
}
function kelvin_voigt_func(σ, E, η, ε) {
    var dt = ε[1][0]-ε[0][0];
    var k = 0.0;
    var K0 = 0.0;
    var K1 = 0.0;

    for(var i = 1; i < ε.length; i++) {
        var t = ε[i][0];
        // Trapezodial Rule Integration
        K0 = K1;
        K1 = σ[i][1]/η * Math.exp(E*t/η);
        k = k + ( K1 + K0 ) * dt/2.0;
        ε[i][1] = Math.exp(-E*t/η) * k;
    }
}

function general(σ, A, T, E, n, ε) {
    var dt = ε[1][0]-ε[0][0];
    var k = 0.0;
    var K0 = 0.0;
    var K1 = 0.0;
    var R = 8.3144598; // J mol^-1 K^-1
    // E - Activation Energy kJ/mol
    var EJ = E * 1e3; // J mol^-1
    for(var i = 1; i < ε.length; i++) {
        K0 = K1;
        K1 = A * Math.pow(σ[i][1]*2,n) * Math.exp(-EJ/(R*T));
        k = k + (K1 + K0) * dt/2.0;
        ε[i][1] = k;
    }
}

function elastic_func(σ, E, ε) {
    for(var i = 0; i < ε.length; i++) {
        ε[i][1] = σ[i][1] / E;
    }
}

var plot;

function update_plot() {
    var data = plot.getData();
    var σ = data[0].data;
    var ε = data[1].data;

    var model = $("#model").val();
    if (model == "e") {
        var E = parseFloat($("#elastic").val());
        elastic_func(σ, E, ε);
    }
    if (model == "v") {
        var η = parseFloat($("#viscous").val());
        viscous_func(σ, η, ε);
    }
    if (model == "max") {
        var η = parseFloat($("#max_viscous").val());
        var E = parseFloat($("#max_elastic").val());
        maxwell_func(σ, E, η, ε);
    }
    if (model == "kv") {
        var η = parseFloat($("#kv_viscous").val());
        var E = parseFloat($("#kv_elastic").val());
        kelvin_voigt_func(σ, E, η, ε);
    }
    if (model == "s") {
        var η  = parseFloat($("#s_viscous" ).val());
        var E1 = parseFloat($("#s_elastic1").val());
        var E2 = parseFloat($("#s_elastic2").val());
        series_func(σ, E1, E2, η, ε);
    }
    if (model == "s2") {
        var η  = parseFloat($("#s2_viscous" ).val());
        var E1 = parseFloat($("#s2_elastic1").val());
        var E2 = parseFloat($("#s2_elastic2").val());
        series2_func(σ, E1, E2, η, ε);
    }
    if (model == "gen") {
        var A = parseFloat($("#gen_constant").val());
        var T = parseFloat($("#gen_temperature").val());
        var E = parseFloat($("#gen_estar").val());
        var n = parseFloat($("#gen_power").val());
        general(σ, A, T, E, n, ε);
    }

    plot.setData(data);
    plot.setupGrid();
    plot.draw();
}

$(function() {

    var dt = 0.01;
	  //var t = [];
    var σ = [];
    var ε = [];

		for (var i = 0; i < 6; i += dt) {
        //t.push(i);
        if(i >= 1.0 && i < 3.0) {
            σ.push([i,1.0]);
        } else {
            σ.push([i,0.0]);
        }
        ε.push([i,0.0]);
		}

    var opts = {
        series: {
            lines: {
                show: true,
                fill: true,
                fillColor: {colors: [{opacity: 0.1},{opacity:0.5}]},
            },
        },
        points: {
            show: false,
        },
        colors : ["black","red"],
        legend : {
            show: true,
            //container: '#legendholder' ,
            position: 'ne',
        }
    };
    data = [
        { label: 'Stress σ', data: σ },
        { label: 'Strain ε', data: ε },

    ];
		plot = $.plot("#placeholder", data, opts);

    $("#model").on('input', function() {
        update_plot();
        show_model();
        canvas_update( $(this).val() );
    });
    update_plot();
    show_model();

    var divs = ["elastic", "viscous",
                "max_elastic","max_viscous",
                "kv_elastic", "kv_viscous",
                "s_elastic1", "s_elastic2", "s_viscous",
                "s2_elastic1", "s2_elastic2", "s2_viscous",
                "gen_constant", "gen_temperature", "gen_estar",
               ];
    for(var i = 0; i < divs.length; i++) {
        var div = "#" + divs[i];
        var val = div + "value";
        set_changes(div, val);
        $(div).trigger("input");
    }

    canvas_update( $("#model").val() );
});

function spring(ctx, x0,y0, T,A) {
    ctx.beginPath();
    ctx.moveTo(x0,y0);
    // Spring
    ctx.lineTo(x0+10,y0);
    for(var i = 0; i < T*6.6; i++) {
        var x = T*0.5 * Math.cos( 2 * Math.PI * i / T );
        var y = A * Math.sin( 2 * Math.PI * i / T );
        ctx.lineTo(x0+10+i+x,y0+y);
    }
    var x1 = x0+10+i+x+20;
    ctx.lineTo(x1,y0);
    ctx.stroke();
    return [x1,y0];
}

function dashpot(ctx, x,y) {
    var w = 30;
    var h = 20;
    var x0 = 30;

    // Viscous Gray Fluid
    ctx.beginPath();
    ctx.rect(x + x0, y - h, w, h*2);
    ctx.fillStyle = "#dddddd";
    ctx.fill();

    // Plunger
    ctx.beginPath();
    ctx.moveTo(x,     y);
    ctx.lineTo(x + 40,y);
    ctx.lineTo(x + 40,y+10);
    ctx.lineTo(x + 40,y-10);
    ctx.stroke();

    // Fluid Container
    ctx.moveTo(x + 30, y + 20);
    ctx.lineTo(x + 60, y + 20);
    ctx.lineTo(x + 60, y - 20);
    ctx.lineTo(x + 30, y - 20);
    ctx.stroke();

    // End Connector
    ctx.moveTo(x + 60, y);
    ctx.lineTo(x + 60 + 30, y);
    ctx.stroke();

    return [x+50+40,y];
}
function parallel(ctx,x,y,T,A) {
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+10,y);
    ctx.lineTo(x+10,y+30);
    ctx.lineTo(x+10,y-30);
    ctx.stroke();
    var xy1 = spring(ctx,  x+10, y+30, T, A);
    var xy2 = dashpot(ctx, x+10, y-30);

    ctx.beginPath();
    ctx.moveTo(xy1[0],xy1[1]);
    ctx.lineTo(xy2[0],xy2[1]);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineTo(xy1[0] , y );
    ctx.lineTo(xy1[0] + 10 ,y );
    ctx.stroke();
    return [xy1[0]+10, y];
}

function canvas_update(model) {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var T = 10.0;
    var A = 15.0;
    ctx.beginPath();
    ctx.rect(0, 0, 400, 150);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    var xy = [0, 25];
    if(model == "e") {
        var xy = spring(ctx, xy[0]+130, xy[1], T, A);
    }
    if (model == "v") {
        var xy = dashpot(ctx, xy[0]+130,xy[1]);
    }
    if (model == "max") {
        var xy = spring(ctx, xy[0]+70, xy[1], T, A);
        var xy = dashpot(ctx, xy[0],xy[1]);
    }
    if (model == "kv") {
        xy[1] = xy[1] + 30;
        var xy = parallel(ctx, xy[0]+130,xy[1],T,A);
    }
    if (model == "s") {
        xy[1] = xy[1] + 50;
        var xy = spring(ctx, xy[0]+70, xy[1], T, A);
        parallel(ctx, xy[0],xy[1],T,A);
    }
    if (model == "s2") {
        xy[1] = xy[1] + 30;
        ctx.beginPath();
        ctx.moveTo(xy[0],xy[1]);
        ctx.lineTo(xy[0]+20,xy[1]);
        ctx.lineTo(xy[0]+20,xy[1]-30);
        ctx.lineTo(xy[0]+20,xy[1]+30);
        ctx.lineTo(xy[0]+20+60,xy[1]+30);
        ctx.stroke();
        xy[0] += 20;
        xy[1] -= 30;
        var xy1 = spring(ctx, xy[0], xy[1], T, A);
        var xy2 = dashpot(ctx, xy1[0], xy1[1]);
        xy[1] += 60;
        xy[0] += 60;
        var xy = spring(ctx,xy[0],xy[1], T, A);
        ctx.beginPath();
        ctx.moveTo(xy[0],xy[1]);
        ctx.lineTo(xy[0]+30,xy[1]);
        ctx.lineTo(xy[0]+30,xy[1]-60);
        ctx.lineTo(xy[0]+30,xy[1]-30);
        ctx.lineTo(xy[0]+30+20,xy[1]-30);
        ctx.stroke();

        //parallel(ctx, xy[0],xy[1],T,A);
    }
}

function show_model() {
    var divs = ["#ElasticModel","#ViscousModel","#MaxwellModel","#KelvinVoigtModel", "#SeriesModel", "#SeriesTwoModel", "#General"];
    for(var i = 0; i < divs.length; i++) {
        $(divs[i]).hide();
    }
    var model = $("#model").val();
    if (model == "e") {
        $("#ElasticModel").show();
    }
    if (model == "v") {
        $("#ViscousModel").show();
    }
    if (model == "max") {
        $("#MaxwellModel").show();
    }
    if (model == "kv") {
        $("#KelvinVoigtModel").show();
    }
    if (model == "s") {
        $("#SeriesModel").show();
    }
    if (model == "s2") {
        $("#SeriesTwoModel").show();
    }
    if (model == "gen") {
        $("#General").show();
    }
}
function set_changes(xsel, xval) {
    $(xsel).on('input', function() {
        $(xval).html( $(this).val() );
        update_plot();
    });
}

