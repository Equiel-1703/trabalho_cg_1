#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_normal;

out vec4 fragColor;

uniform vec3 u_light_direction;

void main() {
    // Get dot product of light direction and normal
    float dotProduct = dot(v_normal, u_light_direction);

    // Set the fragment color to red
    fragColor = v_color * dotProduct;
}