#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_normal;

out vec4 fragColor;

uniform vec3 u_light_direction;
uniform float u_enable_vertex_color;
uniform float u_enable_material_color;
uniform vec3 u_material_color;

void main() {
    // vec3 n_normal = normalize(v_normal);
    // float dotProduct = dot(n_normal, u_light_direction);

    fragColor = (u_enable_vertex_color * v_color) + (u_enable_material_color * vec4(u_material_color, 1.0f));
    // fragColor.rgb *= (-dotProduct); // Multiply the color by the dot product for directional light
}