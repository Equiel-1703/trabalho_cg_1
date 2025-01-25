#version 300 es

in vec4 a_position;
in vec2 a_uv;
in vec3 a_normal;
in vec4 a_color;

uniform mat4 u_model_matrix;
uniform mat4 u_perspective_projection;
uniform mat4 u_camera_matrix;

out vec4 v_color;
out vec3 v_normal;

void main() {
    v_normal = normalize(mat3(u_model_matrix) * a_normal);
    v_color = vec4(a_color.x + a_uv.x, a_color.y + a_uv.y, a_color.z, 1.0f);
    gl_Position = u_perspective_projection * u_camera_matrix * u_model_matrix * a_position;
}