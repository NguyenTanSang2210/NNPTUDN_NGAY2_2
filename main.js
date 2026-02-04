/**
 * Lấy và hiển thị danh sách tất cả posts từ server
 * Posts đã xóa mềm (isDeleted: true) sẽ được hiển thị với gạch ngang
 */
async function getData() {
    try {
        // Gọi API để lấy danh sách posts
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('table_body');
        body.innerHTML = '';
        
        // Duyệt qua từng post và hiển thị lên bảng
        for (const post of posts) {
            // Kiểm tra nếu post đã bị xóa mềm thì thêm style gạch ngang
            let rowStyle = post.isDeleted ? "style='text-decoration: line-through; opacity: 0.5;'" : "";
            body.innerHTML += `<tr ${rowStyle}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td><input type='submit' value='Delete' onclick='deletePost(${post.id})' ${post.isDeleted ? 'disabled' : ''}></td>
            </tr>`
        }
    } catch (error) {
        console.log('Lỗi khi lấy dữ liệu:', error);
    }
}
/**
 * Lưu post mới hoặc cập nhật post hiện có
 * Nếu ID trống -> tạo mới với ID tự động tăng (maxId + 1)
 * Nếu ID đã tồn tại -> cập nhật post đó
 */
async function savePost() {
    // Lấy giá trị từ form input
    let inputId = document.getElementById('txt_id').value.trim();
    let title = document.getElementById('txt_title').value.trim();
    let views = document.getElementById('txt_views').value.trim();
    
    // Validate dữ liệu đầu vào
    if (!title) {
        alert('Vui lòng nhập title!');
        return;
    }
    if (!views || isNaN(views)) {
        alert('Vui lòng nhập views hợp lệ!');
        return;
    }
    
    // Nếu ID rỗng -> tạo ID tự động
    if (!inputId) {
        // Lấy tất cả posts để tìm maxId
        let resAllPosts = await fetch('http://localhost:3000/posts');
        let allPosts = await resAllPosts.json();
        
        // Tìm ID lớn nhất trong danh sách
        let maxId = 0;
        for (const post of allPosts) {
            let currentId = parseInt(post.id);
            if (currentId > maxId) {
                maxId = currentId;
            }
        }
        inputId = (maxId + 1).toString();
    }
    
    // Kiểm tra xem ID đã tồn tại chưa
    let getItem = await fetch('http://localhost:3000/posts/' + inputId);
    
    if (getItem.ok) {
        // Cập nhật post hiện có (PUT)
        let res = await fetch('http://localhost:3000/posts/' + inputId, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: inputId,
                title: title,
                views: parseInt(views),
                isDeleted: false
            })
        });
        
        if (res.ok) {
            alert('Cập nhật thành công!');
            clearForm();
            getData(); // Refresh danh sách
        }
    } else {
        // Tạo post mới (POST)
        let res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: inputId,
                title: title,
                views: parseInt(views),
                isDeleted: false
            })
        });
        
        if (res.ok) {
            alert('Thêm mới thành công!');
            clearForm();
            getData(); // Refresh danh sách
        }
    }
}
/**
 * Xóa mềm (soft delete) một post bằng cách đánh dấu isDeleted: true
 * @param {string|number} postId - ID của post cần xóa
 */
async function deletePost(postId) {
    try {
        // Lấy thông tin post hiện tại
        let getRes = await fetch('http://localhost:3000/posts/' + postId);
        if (!getRes.ok) {
            alert('Không tìm thấy post!');
            return;
        }
        
        let post = await getRes.json();
        
        // Cập nhật trường isDeleted thành true (xóa mềm)
        let res = await fetch('http://localhost:3000/posts/' + postId, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...post,
                isDeleted: true
            })
        });
        
        if (res.ok) {
            alert('Xóa mềm thành công!');
            getData(); // Refresh danh sách
        }
    } catch (error) {
        console.log('Lỗi khi xóa:', error);
    }
}

/**
 * Xóa tất cả giá trị trong form nhập liệu
 */
function clearForm() {
    document.getElementById('txt_id').value = '';
    document.getElementById('txt_title').value = '';
    document.getElementById('txt_views').value = '';
}
// Gọi hàm getData() khi trang web được load
getData();

