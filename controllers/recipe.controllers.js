const express = require('express');
const { Recipe } = require("../models");
const { nanoid } = require("nanoid");
const Validator = require("fastest-validator");
const v = new Validator();
const { Op } = require("sequelize");
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/recipes/images/'); 
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, Date.now() + '-' + file.fieldname + '.' + ext);
  },
});



// CREATE RECIPE
function createRecipe(req, res, next) {
    const data = {
      id: nanoid(10),
      name: req.body.name,
      ingredient: req.body.ingredient,
      category: req.body.category,
      image: req.file ? req.file.filename : req.body.image,
      createdAt: new Date(),
    };
  
    const schema = {
      name: { type: "string", min: 5, max: 50, optional: true },
      ingredient: { type: "string", min: 5, max: 255, optional: true },
      category: { type: "string", min: 3, max: 50, optional: true },
      image: { type: "string", optional: true } // Image bersifat opsional
    };
  
    // VALIDASI DATA
    const validationResult = v.validate(data, schema);
  
    if (validationResult !== true) {
      res.status(400).json({
        message: "Validation Failed",
        data: validationResult,
      });
    } else {
      Recipe.create(data)
        .then((result) => {
          res.status(200).json({
            message: "Success",
            data: result,
          });
        })
        .catch((err) => {
          console.error(err); 
          res.status(500).json({
            message: "Create Recipe Failed",
            data: err,
          });
        });
    }
}

// READ ALL RECIPES
function readRecipes(req, res, next) {
  Recipe.findAll()
    .then((recipes) => {
      res.status(200).json({
        message: "Success",
        data: recipes,
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Read Recipes Failed",
        data: err,
      });
    });
}

// READ RECIPE BY ID
function readRecipeById(req, res, next) {
    const recipeId = req.params.id;
  
    // Check if the recipe with the given ID exists
    Recipe.findByPk(recipeId)
      .then((recipe) => {
        if (!recipe) {
          // If recipe is not found, return an error
          res.status(404).json({
            message: "Recipe not found",
            data: null,
          });
        } else {
          // If recipe exists, return the result
          res.status(200).json({
            message: "Success",
            data: recipe,
          });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Read Recipe Failed",
          data: err,
        });
      });
  }
  

// UPDATE RECIPE
function updateRecipe(req, res, next) {
  const data = {
    name: req.body.name,
    ingredient: req.body.ingredient,
    category: req.body.category,
    image: req.file ? req.file.filename : req.body.image,
    updatedAt: new Date(),
  };

  const schema = {
    name: { type: "string", min: 5, max: 50, optional: true },
    ingredient: { type: "string", min: 5, max: 255, optional: true },
    category: { type: "string", min: 3, max: 50, optional: true },
    image: { type: "string", optional: true } 
  };

  // VALIDASI DATA
  const validationResult = v.validate(data, schema);

  if (validationResult !== true) {
    // Data tidak valid
    res.status(400).json({
      message: "Validation Failed",
      data: validationResult,
    });
  } else {
    // Update recipe jika data valid
    Recipe.update(data, { where: { id: req.params.id } })
      .then((result) => {
        res.status(200).json({
          message: "Success update data",
          data: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: "Update Recipe Failed",
          data: err,
        });
      });
  }
}

// DELETE RECIPE
function deleteRecipe(req, res, next) {
    const recipeId = req.params.id;
  
    // Check if the recipe with the given ID exists
    Recipe.findByPk(recipeId)
      .then((recipe) => {
        if (!recipe) {
          // If recipe is not found, return an error
          res.status(404).json({
            message: "Recipe not found",
            data: null,
          });
        } else {
          // If recipe exists, proceed with deletion
          Recipe.destroy({ where: { id: recipeId } })
            .then((result) => {
              res.status(200).json({
                message: "Success Delete Data",
                data: result,
              });
            })
            .catch((err) => {
              res.status(500).json({
                message: "Delete Recipe Failed",
                data: err,
              });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({
          message: "Error checking recipe existence",
          data: err,
        });
      });
  }

 // SEARCH RECIPE BY NAME
function searchRecipeByName(req, res, next) {
  const searchTerm = req.query.q; // Ambil nilai query parameter q
  if (!searchTerm) {
    return res.status(400).json({
      message: "Search term is required",
      data: null,
    });
  }

  Recipe.findAll({
    where: {
      name: {
        [Op.like]: `%${searchTerm}%`, // Gunakan operator LIKE pada Sequelize
      },
    },
  })
    .then((recipes) => {
      if (recipes.length === 0) {
        res.status(404).json({ // Jika tidak ada recipe yang ditemukan
          message: "Recipes not found", 
          data: null,
        });
      } else {
        res.status(200).json({ // Jika ada recipe yang ditemukan
          message: "Success",
          data: recipes,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ // Jika terjadi error
        message: "Search Recipe By Name Failed", 
        data: err,
      });
    });
}
  

  
module.exports = {
  createRecipe,
  readRecipes,
  readRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipeByName,
};
