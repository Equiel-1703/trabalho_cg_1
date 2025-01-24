export default class FileLoader {
    static async loadShader(shader_path) {
        const response = await fetch(shader_path);

        if (!response.ok) {
            throw new Error('Failed to load file ' + shader_path + ':' + response.status + ' - ' + response.statusText);
        }

        const text = await response.text();

        return text;
    }
}