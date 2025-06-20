const prisma = require('../models/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
  try {
    const { correo, nombre_completo, telefono, contraseña, rol } = req.body;
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        correo,
        nombre_completo,
        telefono,
        contraseña: hashedPassword,
        rol,
      },
    });

    res.status(201).json({ mensaje: 'Usuario registrado', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ error: 'Error en el registro' });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { correo } });

    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ mensaje: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ error: 'Error en el inicio de sesión' });
  }
};
