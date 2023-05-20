import { Request, Response } from "express";
import _ from "lodash";
import { HydratedDocument, Types } from "mongoose";
import { Budget } from "../models/Budget";
import { ITransaction, Transaction } from "../models/Transaction";

import { ICategory } from "../models/User";

import { logger } from "../log/logger";
import { FIELD_INVALID, FIELD_MISSING } from "../@message";

// category settings controller

export const updateV2 = async (req: Request, res: Response) => {
  try {
    /* validate */
    if (!("categories" in req.body))
      return res.status(400).send({ message: FIELD_MISSING("categories") });

    const user = req.user!;

    const categoryDict: { [key: string]: ICategory } = Object.fromEntries(
      user.categories.map((category: any) => [
        category._id,
        category.toObject(),
      ])
    );

    const _categories: Types.DocumentArray<ICategory> = new Types.DocumentArray(
      []
    );

    const added: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);
    const updated: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);
    const removed: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);

    let defaultExpenseCategory: any = user.findDefaultExpenseCategory();
    let defaultIncomeCategory: any = user.findDefaultIncomeCategory();

    for (let _category of req.body.categories) {
      for (let field of ["title", "icon"]) {
        if (!(field in _category)) {
          return res.status(400).send({ message: FIELD_MISSING(field) });
        }
      }

      /* create category */
      if (!("_id" in _category)) {
        const isExpense =
          "isExpense" in _category ? _category.isExpense : false;
        const isIncome = "isIncome" in _category ? _category.isIncome : false;
        if (isExpense === isIncome)
          return res.status(400).send({ message: FIELD_INVALID("isExpense") });

        const category = {
          isExpense,
          isIncome,
          isDefault: false,
          title: _category.title,
          icon: _category.icon,
        };
        _categories.push(category);
        added.push(category);
      } else {
        /* update category */
        const key = _category._id;
        const exCategory = categoryDict[key];
        if (!exCategory)
          return res.status(404).send({ message: "category not found" });

        const category = {
          ...exCategory,
          title: _category.title,
          icon: _category.icon,
        };

        if (!exCategory.isDefault) {
          _categories.push(category);
        } else {
          if (exCategory.isExpense) {
            defaultExpenseCategory = category;
          } else {
            defaultIncomeCategory = category;
          }
        }

        delete categoryDict[key];

        if (
          exCategory.title !== category.title ||
          exCategory.icon !== category.icon
        ) {
          updated.push(category);
        }
      }
    }
    /* remove category */
    for (const category of Object.values(categoryDict)) {
      if (!category.isDefault) removed.push(category);
    }

    user.categories = new Types.DocumentArray([
      ..._categories,
      defaultExpenseCategory,
      defaultIncomeCategory,
    ]);

    await user.saveReqUser();

    for (const category of updated) {
      const key = category._id;
      const budgets = await Budget.find({
        userId: user._id,
        "categories.categoryId": key,
      });
      const transactions = await Transaction.find({
        userId: user._id,
        "category.categoryId": key,
      });

      await Promise.all([
        budgets.forEach((budget) => {
          const idx = budget.findCategoryIdx(key);
          Object.assign(budget.categories[idx], {
            ...category,
            categoryId: key,
          });
          budget.save();
        }),
        transactions.forEach((transaction) => {
          Object.assign(transaction.category, {
            ...category,
            categoryId: key,
          });
          transaction.save();
        }),
      ]);
    }

    for (const category of removed) {
      const key = category._id;
      const budgets = await Budget.find({
        userId: user._id,
        "categories.categoryId": key,
      });

      const objToUpdate = [];
      for (let budget of budgets) {
        const transactions = await Transaction.find({
          userId: user._id,
          budgetId: budget._id,
          "category.categoryId": key,
        });

        for (let transaction of transactions) {
          if (transaction.category.isExpense) {
            transaction.category = {
              ...defaultExpenseCategory,
              categoryId: defaultExpenseCategory._id,
            };
          } else {
            transaction.category = {
              ...defaultIncomeCategory,
              categoryId: defaultIncomeCategory._id,
            };
          }
          objToUpdate.push(transaction);
        }

        const idx = budget.findCategoryIdx(category._id!);
        const bCategory = budget.categories[idx];
        if (category.isExpense) {
          budget.increaseDefaultExpenseCategory(
            "amountPlanned",
            bCategory.amountPlanned
          );
          budget.increaseDefaultExpenseCategory(
            "amountCurrent",
            bCategory.amountCurrent
          );
          budget.increaseDefaultExpenseCategory(
            "amountScheduled",
            bCategory.amountScheduled
          );
        } else {
          budget.increaseDefaultIncomeCategory(
            "amountPlanned",
            bCategory.amountPlanned
          );
          budget.increaseDefaultIncomeCategory(
            "amountCurrent",
            bCategory.amountCurrent
          );
          budget.increaseDefaultIncomeCategory(
            "amountScheduled",
            bCategory.amountScheduled
          );
        }
        budget.categories.splice(idx, 1);

        objToUpdate.push(budget);
      }

      await Promise.all(objToUpdate.map((obj) => obj.save()));
    }

    return res.status(200).send({
      categories: user.categories,
      added,
      updated,
      removed,
    });
  } catch (err: any) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};

export const updateV3 = async (req: Request, res: Response) => {
  try {
    /* validate */
    if (!("isExpense" in req.body) && !("isIncome" in req.body))
      return res.status(400).send({ message: FIELD_MISSING("isExpense") });

    if (!("categories" in req.body))
      return res.status(400).send({ message: FIELD_MISSING("cateogires") });

    const isExpense = "isExpense" in req.body ? req.body.isExpense : false;
    const isIncome = "isIncome" in req.body ? req.body.isIncome : false;
    if (isExpense === isIncome) {
      return res.status(400).send({ message: FIELD_INVALID("isExpense") });
    }

    const user = req.user!;

    const categoryDict: { [key: string]: ICategory } = Object.fromEntries(
      user.categories.map((category: any) => [
        category._id,
        category.toObject(),
      ])
    );

    const _categories: Types.DocumentArray<ICategory> = new Types.DocumentArray(
      []
    );

    const added: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);
    const updated: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);
    const removed: Types.DocumentArray<ICategory> = new Types.DocumentArray([]);

    let defaultExpenseCategory: any = user.findDefaultExpenseCategory();
    let defaultIncomeCategory: any = user.findDefaultIncomeCategory();

    for (let _category of req.body.categories) {
      for (let field of ["title", "icon"]) {
        if (!(field in _category)) {
          return res.status(400).send({ message: FIELD_MISSING(field) });
        }
      }

      /* create category */
      if (!("_id" in _category)) {
        const category = {
          isExpense,
          isIncome,
          isDefault: false,
          title: _category.title,
          icon: _category.icon,
        };
        _categories.push(category);
        added.push(category);
      } else {
        /* update category */
        const key = _category._id;
        const exCategory = categoryDict[key];
        if (!exCategory)
          return res.status(404).send({ message: "category not found" });

        if (exCategory.isExpense !== isExpense)
          return res.status(409).send({
            message: `isExpense not matching with category`,
            isExpense,
            exCategory,
          });

        const category = {
          ...exCategory,
          title: _category.title,
          icon: _category.icon,
        };

        if (!exCategory.isDefault) {
          _categories.push(category);
        } else {
          if (exCategory.isExpense) {
            defaultExpenseCategory = category;
          } else {
            defaultIncomeCategory = category;
          }
        }

        delete categoryDict[key];

        if (
          exCategory.title !== category.title ||
          exCategory.icon !== category.icon
        ) {
          updated.push(category);
        }
      }
    }
    /* remove category */
    for (const category of Object.values(categoryDict)) {
      if (!category.isDefault) {
        if (category.isExpense === isExpense) {
          removed.push(category);
        } else {
          _categories.push(category);
        }
      }
    }

    user.categories = new Types.DocumentArray([
      ..._categories,
      defaultExpenseCategory,
      defaultIncomeCategory,
    ]);

    await user.saveReqUser();

    for (const category of updated) {
      const key = category._id;
      const budgets = await Budget.find({
        userId: user._id,
        "categories.categoryId": key,
      });
      const transactions = await Transaction.find({
        userId: user._id,
        "category.categoryId": key,
      });

      await Promise.all([
        budgets.forEach((budget) => {
          const idx = budget.findCategoryIdx(key);
          Object.assign(budget.categories[idx], {
            ...category,
            categoryId: key,
          });
          budget.save();
        }),
        transactions.forEach((transaction) => {
          Object.assign(transaction.category, {
            ...category,
            categoryId: key,
          });
          transaction.save();
        }),
      ]);
    }

    for (const category of removed) {
      const key = category._id;
      const budgets = await Budget.find({
        userId: user._id,
        "categories.categoryId": key,
      });

      const objToUpdate = [];
      for (let budget of budgets) {
        const transactions = await Transaction.find({
          userId: user._id,
          budgetId: budget._id,
          "category.categoryId": key,
        });

        for (let transaction of transactions) {
          if (transaction.category.isExpense) {
            transaction.category = {
              ...defaultExpenseCategory,
              categoryId: defaultExpenseCategory._id,
            };
          } else {
            transaction.category = {
              ...defaultIncomeCategory,
              categoryId: defaultIncomeCategory._id,
            };
          }
          objToUpdate.push(transaction);
        }

        const idx = budget.findCategoryIdx(category._id!);
        const bCategory = budget.categories[idx];
        if (category.isExpense) {
          budget.increaseDefaultExpenseCategory(
            "amountPlanned",
            bCategory.amountPlanned
          );
          budget.increaseDefaultExpenseCategory(
            "amountCurrent",
            bCategory.amountCurrent
          );
          budget.increaseDefaultExpenseCategory(
            "amountScheduled",
            bCategory.amountScheduled
          );
        } else {
          budget.increaseDefaultIncomeCategory(
            "amountPlanned",
            bCategory.amountPlanned
          );
          budget.increaseDefaultIncomeCategory(
            "amountCurrent",
            bCategory.amountCurrent
          );
          budget.increaseDefaultIncomeCategory(
            "amountScheduled",
            bCategory.amountScheduled
          );
        }
        budget.categories.splice(idx, 1);

        objToUpdate.push(budget);
      }

      await Promise.all(objToUpdate.map((obj) => obj.save()));
    }

    return res.status(200).send({
      categories: user.categories,
      added,
      updated,
      removed,
    });
  } catch (err: any) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};

/**
 * Read user's category settings
 *
 * @return categories
 */
export const find = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    return res.status(200).send({
      categories: user.categories,
    });

    // return res.status(200).send({ categories: user.categories });
  } catch (err: any) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
  }
};
