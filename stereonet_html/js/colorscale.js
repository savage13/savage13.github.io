
var Colorscale = function ( obj ) {

    this.min = 0;
    this.max = 1;
    this.scale = this.max - this.min;

    this.map = new Array();

    this.map.push( { 'v': 0.0, 'r': 255, 'g': 255, 'b': 255, 'a': 255 } )
    this.map.push( { 'v': 1.0, 'r': 0,   'g': 0,   'b': 0,   'a': 255 } )

    this.limits = function (min, max) {
        this.min = min;
        this.max = max;
    }

    this.z_to_rgba = function ( z ) {
        var n = this.map.length - 1;
        if(z < this.map[0]) {
            return this.map[0];
        }
        if(z > this.map[n]) {
            return this.map[n];
        }
        for( i = 0; i < n; i++) {
            if( z >= this.map[i].v && z <= this.map[i+1].v) {
                dz = (z - this.map[i].v) / (this.map[i+1].v - this.map[i].v);
                r = this.map[i].r + dz * (this.map[i+1].r - this.map[i].r);
                g = this.map[i].g + dz * (this.map[i+1].g - this.map[i].g);
                b = this.map[i].b + dz * (this.map[i+1].b - this.map[i].b);
                a = this.map[i].a + dz * (this.map[i+1].a - this.map[i].a);
                return { 'r': r, 'g': g, 'b': b, 'a': a, 'v': dz};
            }
        }
        debug("Error finding color in colormap: " + z)
        return { 'r': 0, 'g': 0, 'b': 0, 'a': 0 };
    }

    this.get = function ( z ) {
        return this.z_to_rgba( z );
    }
}