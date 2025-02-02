#version 300 es
precision highp float;

in vec4 v_color;
in vec3 v_normal;
in vec2 v_uv;

out vec4 fragColor;

uniform bool u_enable_texture;
uniform bool u_enable_vertex_color;
uniform bool u_enable_material_color;
uniform bool u_enable_lighting;

uniform vec3 u_material_color;
uniform vec3 u_light_direction;
uniform vec4 u_global_color;
uniform sampler2D u_texture;

void main() {
    fragColor = vec4(0.0f, 0.0f, 0.0f, 1.0f); // Default color
    fragColor = vec4(vec3(u_global_color.rgb * u_global_color.a), 1.0f); // Global color

    // If the texture is enabled, we will use the texture color
    if(u_enable_texture) {
        fragColor += texture(u_texture, v_uv);
    }

    // If the vertex color is enabled, we will use the vertex color too
    if(u_enable_vertex_color) {
        fragColor += v_color;
    }

    // If the material color is enabled, we will use the material color too
    if(u_enable_material_color) {
        fragColor += vec4(u_material_color, 1.0f);
    }

    // Normalize the color if some value greater than 1.0f
    float max = max(max(fragColor.r, fragColor.g), fragColor.b);
    if(max > 1.0f) {
        fragColor = vec4(fragColor.rgb / max, clamp(fragColor.a, 0.0f, 1.0f));
    } else {
        fragColor = vec4(fragColor.rgb, clamp(fragColor.a, 0.0f, 1.0f));
    }

    // Apply lighting (if enabled)
    if(u_enable_lighting) {
        float dot_product = dot(normalize(v_normal), normalize(u_light_direction));
        float light = abs(dot_product);
        fragColor = vec4(fragColor.rgb * light, fragColor.a);
    }
}