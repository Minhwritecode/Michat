import axios from "axios";
import { ApiError } from "../libs/utils.js";

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_TOKEN = process.env.TRELLO_TOKEN;

export const createTrelloTask = async (req, res, next) => {
    try {
        const { title, desc, dueDate, labels } = req.body;
        const { boardId = "default", listId = "default" } = req.query;

        if (!title) {
            throw new ApiError(400, "Title is required");
        }

        // Create card on Trello
        const cardData = {
            name: title,
            desc: desc || "",
            idList: listId,
            due: dueDate || null,
            pos: "top"
        };

        const response = await axios.post(
            `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            cardData
        );

        const card = response.data;

        // Add labels if provided
        if (labels && labels.length > 0) {
            for (const labelName of labels) {
                try {
                    // Get or create label
                    const labelResponse = await axios.get(
                        `https://api.trello.com/1/boards/${boardId}/labels?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
                    );
                    
                    let label = labelResponse.data.find(l => l.name === labelName);
                    if (!label) {
                        // Create new label
                        const createLabelResponse = await axios.post(
                            `https://api.trello.com/1/labels?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                            {
                                name: labelName,
                                color: "blue",
                                idBoard: boardId
                            }
                        );
                        label = createLabelResponse.data;
                    }

                    // Add label to card
                    await axios.post(
                        `https://api.trello.com/1/cards/${card.id}/idLabels?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
                        { value: label.id }
                    );
                } catch (error) {
                    console.error("Error adding label:", error);
                }
            }
        }

        res.status(201).json({
            success: true,
            message: "Trello task created successfully",
            task: {
                id: card.id,
                title: card.name,
                description: card.desc,
                url: card.url,
                dueDate: card.due,
                labels: labels || []
            }
        });

    } catch (error) {
        console.error("Trello API error:", error);
        next(new ApiError(500, "Failed to create Trello task"));
    }
};

export const getTrelloBoards = async (req, res, next) => {
    try {
        const response = await axios.get(
            `https://api.trello.com/1/members/me/boards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );

        res.status(200).json({
            success: true,
            boards: response.data.map(board => ({
                id: board.id,
                name: board.name,
                url: board.url
            }))
        });

    } catch (error) {
        console.error("Trello boards error:", error);
        next(new ApiError(500, "Failed to fetch Trello boards"));
    }
};

export const getTrelloLists = async (req, res, next) => {
    try {
        const { boardId } = req.params;

        const response = await axios.get(
            `https://api.trello.com/1/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
        );

        res.status(200).json({
            success: true,
            lists: response.data.map(list => ({
                id: list.id,
                name: list.name,
                closed: list.closed
            }))
        });

    } catch (error) {
        console.error("Trello lists error:", error);
        next(new ApiError(500, "Failed to fetch Trello lists"));
    }
}; 