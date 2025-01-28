#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_normal;

out vec4 fragColor;

uniform vec3 u_light_direction;

void main() {
    vec3 n_normal = normalize(v_normal);
    float dotProduct = dot(n_normal, u_light_direction);

    fragColor = v_color;
    fragColor.rgb *= (-dotProduct);
}