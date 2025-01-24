#version 300 es

in vec4 a_position;

uniform mat4 perspective_projection;

void main(){
    gl_Position = perspective_projection * a_position;
}