const ar = document.querySelector('.products-center')
const totalP = document.querySelector('.cart-total')
const totalI = document.querySelector('.cart-items')
const cartContent = document.querySelector('.cart-content')
const cartDom = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartBtn = document.querySelector('.cart-btn')
const cartCloseBtn = document.querySelector('.close-cart')
const clearCart = document.querySelector('.clear-cart')
const closer = document.querySelector('.products')



let cart = []
class Product {
  async getProducts () {
    try {
      const result = await fetch('products.json')
      const data = await result.json()
      let products = data.items;
       products = products.map((item) => {
        const {title, price} = item.fields
        const {id} = item.sys
        const image = item.fields.image.fields.file.url
        return {title, price, id, image}
      })
    return products
    } 
    catch (err) {
      console.log(err);
    }

  }
}

 
class View {
  displayProducts(tasks) {
    let showProduct = '';
    tasks.forEach(element => {
      showProduct += `
      <article class="product">
      <div class="img-container">
        <img src=${element.image} alt=${element.title} class="product-img">
        <button class="bag-btn" data-id=${element.id}>افزودن به سبد خرید</button>
      </div>
      <h3>${element.title}</h3>
      <h4>${element.price}</h4>
    </article>
      `
    });
    ar.innerHTML = showProduct
  }

   getButtonCart () {
    const buttons = [...document.querySelectorAll('.bag-btn')]


    buttons.forEach((item) => {
      const id = item.dataset.id
      item.addEventListener('click', (e) => {
        let cartItem = {...Storage.getProduct(id), amount: 1}
        cart = [...cart, cartItem]
        Storage.SaveCartItem(cart)
        // console.log(cart);

        this.cartValue(cart)

        this.addCartItem(cartItem)

        this.showCartShop()
      })
    })
  }


  cartValue (cart) {
    let totalPrice = 0
    let totalItems = 0

    cart.map(item => {
      totalPrice = totalPrice + item.price * item.amount
      totalItems = totalItems + item.amount
    })
    totalP.textContent = totalPrice
    totalI.textContent = totalItems
  }


  addCartItem (item) {
    const div = document.createElement('div')
    div.classList.add('cart-item')

    div.innerHTML= `
    <img src=${item.image} alt=${item.title} />
    <div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id=${item.id}>حذف</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id=${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>
    `
    cartContent.appendChild(div)
  }

  showCartShop () {
    cartDom.classList.add('showCart')
    cartOverlay.classList.add('transparentBcg')
  }

  initApp () {
    cart = Storage.getItem()
    this.cartValue(cart)
    this.populate(cart)

    cartBtn.addEventListener('click', this.showCartShop)
    cartCloseBtn.addEventListener('click', this.hideCartShop)
    cartOverlay.addEventListener('click', this.hideCartShop)
  }

  populate (cart) {
    cart.forEach(item => {
      return this.addCartItem(item)
    })
  }

  hideCartShop () {
    cartDom.classList.remove('showCart')
    cartOverlay.classList.remove('transparentBcg')
  }

  cartProcess() {
    clearCart.addEventListener('click', () => {
      this.removeProduct()
      })

      cartContent.addEventListener('click', (e) => {
        if(e.target.classList.contains('remove-item')) {
          let removeEl = e.target
          let id = removeEl.dataset.id
          cartContent.removeChild(removeEl.parentElement.parentElement)
          this.removeItem(id)
        }
        // console.log(e.target);

        if(e.target.classList.contains('fa-chevron-up')) {
          let upEl = e.target
          let id = upEl.dataset.id

          let product = cart.find(item => {
            return item.id === id
          })
          product.amount = product.amount + 1

          this.cartValue(cart)
          Storage.SaveCartItem(cart)

          upEl.nextElementSibling.innerText = product.amount

        }

        if(e.target.classList.contains('fa-chevron-down')) {
          let downEl = e.target
          let id = downEl.dataset.id

          let product = cart.find((item) => {
            return item.id === id
          })

          product.amount = product.amount - 1

          if(product.amount > 0) {
            downEl.previousElementSibling.innerText = product.amount
            Storage.SaveCartItem(cart)
            this.cartValue(cart)
          } else {
            cartContent.removeChild(downEl.parentElement.parentElement)
            this.removeItem(id)
          }

        }

      })
  }

  removeProduct() {
    let cartItems = cart.map(item => {
      return item.id
    })
    cartItems.forEach(item => {
      return this.removeItem(item)
    })

    while(cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0])
    }
  }

  removeItem(id) {
    cart = cart.filter(item => {
      return item.id !== id
    })
    this.cartValue(cart)
    Storage.SaveCartItem(cart)
  }


}

class Storage {
  static saveProduct (product) {
    localStorage.setItem('product', JSON.stringify(product))
  }

  static getProduct (id) {
    const product = JSON.parse(localStorage.getItem('product'))

    return product.find(item => item.id === id)
  }
  
  static SaveCartItem (cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  static getItem() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
  }
}

document.addEventListener('DOMContentLoaded', () => { 
  const product = new Product()
  const view = new View()

  view.initApp()

  product.getProducts().then((data) => {
    view.displayProducts(data)
    Storage.saveProduct(data)
  }).then(() => {
    view.getButtonCart()
    view.cartProcess()
  })
})
