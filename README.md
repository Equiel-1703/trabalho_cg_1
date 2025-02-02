# Computer Graphics - Assignment 1
## 3D Scene Editor in WebGL

### Overview
This project is a 3D Scene Editor built using the WebGL API in JavaScript for my Computer Graphics course at the Federal University of Pelotas. The editor allows users to select different 3D models and create a scene by translating, rotating, scaling, and modifying their texture properties. Additionally, users can save and load their own scenes (note: texture images are not included).

The 3D models used in the editor were created by **Kay Lousberg** as part of the "Mini-Game Variety Pack," available on [itch.io](https://kaylousberg.itch.io/kay-kit-mini-game-variety-pack). Full credit for the models goes to him.

### Features
- **Object Creation**: Add various 3D shapes from the Mini-Game Variety Pack.
- **Memory Efficiency**: Models that are not currently displayed in the editor are deallocated from memory (using `gl.delete##` on all their assets). Objects that share the same model file are duplicated efficiently, reusing the same loaded geometry while maintaining individual transformations and texture properties.
- **Transformations**: Translate, rotate, scale, change texture colors, and apply custom texture images.
- **Camera Control**: Navigate the scene using PlayStation 2-style controls!
- **Save/Load Scenes**: Save created scenes in JSON format and reload them later.

### Usage
- Use the **Create Model** tab in the right menu to select and add models to the center of the scene.
- Use the **Model Selector** menu in the left panel to choose objects in the scene and modify their properties.
- Use the **Model Properties** tab in the right menu to adjust object transformations and textures.
- Click the **SAVE SCENE** button to store your scene in JSON format.
- Click the **LOAD SCENE** button to load a previously saved scene.

### Technologies Used
- **WebGL**: For rendering 3D graphics.
- **JavaScript**: For application logic.
- **HTML/CSS**: For the user interface.

### Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request with your changes.

### License
This project is licensed under the GPL-3.0 License.

### Acknowledgements
- Thanks to [WebGL 2 Fundamentals](https://webgl2fundamentals.org/) for an excellent collection of tutorials and tools.
- Huge thanks to **Etay Meiri** from the [OGLDEV](https://www.youtube.com/@OGLDEV) YouTube channel for all the great lectures explaining both theory and implementation logic of the OpenGL API.
- Special thanks to **Kay Lousberg** for the awesome free 3D asset pack.

### Contact
For any inquiries, feel free to contact me at [henrique.grdr@inf.ufpel.edu.br](mailto:henrique.grdr@inf.ufpel.edu.br).
