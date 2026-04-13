const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getWishlist = async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findMany({
            where: { user_id: req.user.userId },
            orderBy: { created_at: 'desc' }
        });
        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
};

const addToWishlist = async (req, res) => {
    try {
        const { title, url, notes } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const item = await prisma.wishlist.create({
            data: {
                user_id: req.user.userId,
                title,
                url,
                notes
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
};

const deleteFromWishlist = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.wishlist.findUnique({
            where: { id: parseInt(id) }
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (item.user_id !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await prisma.wishlist.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Error deleting from wishlist:', error);
        res.status(500).json({ message: 'Error deleting from wishlist' });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    deleteFromWishlist
};
