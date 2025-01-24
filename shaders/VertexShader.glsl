#version 300 es

in vec4 vertex_position;

uniform mat4 perspective_projection;

void main(){
    gl_Position = perspective_projection * vertex_position;
}