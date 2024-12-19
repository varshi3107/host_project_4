document.addEventListener('DOMContentLoaded', function () 
{
    const startButton = document.getElementById('start-button');
    const agreeButton = document.getElementById('agree-button');
    const solveButton = document.getElementById('solve-button');
    const checkButton = document.getElementById('check-button');
    const clearButton = document.getElementById('clear-button');
    const playAgainButton = document.getElementById('play-again-button');
    const introPage = document.getElementById('intro-page');
    const instructionModal = document.getElementById('instruction-modal');
    const sudokuContainer = document.getElementById('sudoku-container');
    const congratulationsModal = document.getElementById('congratulations-modal');
    const sudokuBoard = document.getElementById('sudoku-board');
    let currentPuzzle = []; // To store the current puzzle for resetting or validation

    // Show the instruction modal when clicking start button
    startButton.addEventListener('click', function () {
        introPage.classList.add('hidden');
        instructionModal.style.display = 'flex';
    });

    // Hide the instruction modal and show the Sudoku game when user agrees
    agreeButton.addEventListener('click', function () {
        instructionModal.style.display = 'none';
        sudokuContainer.classList.remove('hidden');
        generateSudokuBoard();
    });

    // Generate a Sudoku puzzle
    function generateSudokuBoard() {
        // Clear the existing board first
        sudokuBoard.innerHTML = '';

        // Generate a new Sudoku puzzle
        currentPuzzle = generateSudoku();

        for (let row = 0; row < 9; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 9; col++) {
                const td = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '1';
                input.max = '9';
                input.value = currentPuzzle[row][col] !== 0 ? currentPuzzle[row][col] : '';
                input.disabled = currentPuzzle[row][col] !== 0; // Disable pre-filled cells
                td.appendChild(input);
                tr.appendChild(td);
            }
            sudokuBoard.appendChild(tr);
        }
    }

    // Sudoku puzzle generation function
    function generateSudoku() {
        let board = Array(9).fill().map(() => Array(9).fill(0));

        // Fill the board with a valid Sudoku solution
        solveSudoku(board);

        // Remove some numbers to create the puzzle
        removeNumbers(board);

        return board;
    }

    // Solve the Sudoku (for generating a valid solution)
    function solveSudoku(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    for (const num of nums) {
                        if (isValid(board, row, col, num)) {
                            board[row][col] = num;
                            if (solveSudoku(board)) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Shuffle array to randomize numbers for solving
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Check if a number is valid in a Sudoku position
    function isValid(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
        }
        const startRow = Math.floor(row / 3) * 3;
        const startCol = Math.floor(col / 3) * 3;
        for (let i = startRow; i < startRow + 3; i++) {
            for (let j = startCol; j < startCol + 3; j++) {
                if (board[i][j] === num) return false;
            }
        }
        return true;
    }

    // Remove some numbers from the board to create the puzzle
    function removeNumbers(board) {
        let count = 40; // Number of cells to remove
        while (count > 0) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (board[row][col] !== 0) {
                board[row][col] = 0;
                count--;
            }
        }
    }

    solveButton.addEventListener('click', function () {
        const board = getBoard();
        const isSolvable = solveSudoku(board);
    
        if (isSolvable) {
            setBoard(board); // Fill the board with the solution
            document.getElementById('try-again-modal').style.display = 'block'; // Show "Try Again" modal
        } else {
            alert('This Sudoku puzzle cannot be solved.');
        }
    });
    
    // Handle "Try Again" button to regenerate the board
    document.getElementById('try-again-button').addEventListener('click', function () {
        document.getElementById('try-again-modal').style.display = 'none'; // Hide the modal
        sudokuBoard.innerHTML = ''; // Clear the current board
        generateSudokuBoard(); // Generate a fresh Sudoku puzzle
    });
    

    // Function to get the Sudoku board values
    function getBoard() {
        return Array.from(sudokuBoard.querySelectorAll('tr')).map(row =>
            Array.from(row.querySelectorAll('td input')).map(cell =>
                cell.value ? parseInt(cell.value) : 0
            )
        );
    }

    // Set the Sudoku board with the solved values
    function setBoard(board) {
        const cells = sudokuBoard.querySelectorAll('td input');
        cells.forEach((cell, index) => {
            cell.value = board[Math.floor(index / 9)][index % 9] || '';
        });
    }

    // Reset the game to the initial state
    playAgainButton.addEventListener('click', function () {
        congratulationsModal.style.display = 'none';
        sudokuContainer.classList.add('hidden');
        introPage.classList.remove('hidden');
        sudokuBoard.innerHTML = ''; // Clear the board
        generateSudokuBoard(); // Generate a fresh puzzle
    });
    checkButton.addEventListener('click', function () {
        const board = getBoard();
        const errors = validateBoard(board);
    
        if (errors.length === 0 && isBoardComplete(board)) {
            // If no errors and the board is complete
            congratulationsModal.style.display = 'flex';
        } else if (errors.length > 0) {
            // If there are errors, show them
            alert('There are errors in your Sudoku solution. Check the highlighted cells.');
            highlightErrors(errors);
        } else {
            alert('Your Sudoku is incomplete. Please fill all cells.');
        }
    });
    
    // Check if the board is complete (all cells are filled)
    function isBoardComplete(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return false; // If any cell is empty, the board is incomplete
                }
            }
        }
        return true; // All cells are filled
    }
    
    // Highlight errors in the board
    function highlightErrors(errors) {
        const cells = sudokuBoard.querySelectorAll('td input');
        cells.forEach(cell => cell.classList.remove('error')); // Clear previous highlights
    
        errors.forEach(({ row, col }) => {
            const index = row * 9 + col;
            cells[index].classList.add('error'); // Highlight invalid cells
        });
    }
    
    // Function to reset after "Play Again"
    playAgainButton.addEventListener('click', function () {
        congratulationsModal.style.display = 'none';
        sudokuBoard.innerHTML = ''; // Clear the board
        generateSudokuBoard(); // Generate a new puzzle
    });
    
    
    // Validate the current board input against Sudoku rules
    function validateBoard(board) {
        const errors = [];
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const num = board[row][col];
                if (num !== 0) {
                    // Temporarily clear the cell to avoid self-check conflict
                    board[row][col] = 0;
                    if (!isValid(board, row, col, num)) {
                        errors.push({ row, col });
                    }
                    board[row][col] = num; // Restore the original value
                }
            }
        }
    
        return errors;
    }
    
    // Highlight cells with errors
    function highlightErrors(errors) {
        const cells = sudokuBoard.querySelectorAll('td input');
        cells.forEach(cell => cell.classList.remove('error')); // Clear previous highlights
    
        errors.forEach(({ row, col }) => {
            const index = row * 9 + col;
            cells[index].classList.add('error'); // Highlight invalid cells
        });
    }
    
    // Clear the Sudoku board
    clearButton.addEventListener('click', function () {
        const inputs = sudokuBoard.querySelectorAll('td input');
        inputs.forEach(input => {
            if (!input.disabled) { // Clear only user-entered values (editable cells)
                input.value = '';
            }
        });
    });
});
