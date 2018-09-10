    precision mediump float;

    // varying vec2 vTextureCoord; // Texture
    //uniform sampler2D uSampler; // Texture
    varying vec4 vColor; // Color


    void main(void) {
        //gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
        gl_FragColor = vColor;
    }
