let eventBus = new Vue()
Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        }
    },
    template: `
     <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div>
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           </li>
         </ul>
       </div>
       <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
        </div>
     </div>
      `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    },

})

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">
    <p v-if="errors.length">
     <b>Please correct the following error(s):</b>
     <ul>
       <li v-for="error in errors">{{ error }}</li>
     </ul>
    </p>

     <p>
       <label for="name">Name:</label>
       <input id="name" v-model="name" placeholder="name">
     </p>
    
     <p>
       <label for="review">Review:</label>
       <textarea id="review" v-model="review"></textarea>
     </p>
    
     <p>
       <label for="rating">Rating:</label>
       <select id="rating" v-model.number="rating">
         <option>5</option>
         <option>4</option>
         <option>3</option>
         <option>2</option>
         <option>1</option>
       </select>
     </p>
    <p>
        <label for="recommend">Would you recommend this product?</label>
        
        <div v-model="recommend" id="recommend">
            <p><input type="radio" name="recommend" value="yes">Yes</p>
            <p><input type="radio" name="recommend" value="no">No</p>                  
        </div>        
   </p>
     <p>
       <input type="submit" value="Submit"> 
     </p>
    
    </form>

 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
            recommend: null
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Rating recommend")
            }
        }
    }

})

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
           <a :href="link">More products like this</a>
       </div>
       

       <div class="product-info">
            <h1 v-if="inventory > 100">{{ sale }}</h1>
           <h1 v-else>{{ title }}</h1>
           <p v-if="inStock">In stock</p>
           <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>
           <span v-show="onSale">On Sale</span>
           <div id="app">
               <p>{{description}}</p>
           </div>

          <p>Shipping: {{ shipping }}</p>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
           
           
           <div v-for="sizes in sizes">
                <p>{{ sizes }}</p>
            </div>
            
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
           <button
             v-on:click="outOfCart"
             :disabled="!inStock"
             :class="{ disabledButton: !inStock }">
                Out of cart
           </button>
           
            <product-information :shipping="shipping" :details="details"></product-information>
            <product-tabs :reviews="reviews"></product-tabs>
<!--            <product-details :details="details"></product-details>-->

      
   </div>
 `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            onSale: "on Sale",
            inventory: 1000,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],

            // cart: 0,
            reviews: [],
            // onSale: true,
            link:"https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            description:"A pair of warm, fuzzy socks."
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
        outOfCart() {
            if (this.cart >= 1){
                this.cart -= 1
            }
            this.$emit('out-of-cart',
                this.variants[this.selectedVariant].variantId);
        },

    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale(){
            return this.brand + ' ' + this.product + ' ' + this.onSale
        },
        shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
            }
        }

    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }

})

Vue.component('product-details', {
    template: `
    <div class="product-details">
        <span>Details:</span>
        <ul v-for="detail in details">
            <li>{{ detail }}</li>
        </ul>
    </div>
    `,
    props: {
        details: {
            type: Array,
        }
    }
})

Vue.component('product-information', {
    template: `
       <div>
        <ul>
         <span class="tab" 
             :class="{activeTab: selectedTab === tab}"
             v-for="(tab, index) in tabs"
             @click="selectedTab = tab">
             {{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Shipping'">


            <select>
                <option v-for="shipping in shippings">{{ shipping }}</option>
            </div>
            

        </div>
        <div v-show="selectedTab === 'Details'">
            <product-details :details="details"></product-details>
        </div>
       </div>
    `,
    props: {
        shipping: {
            type: Function,
            required: false
        },
        details: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            tabs: ['Shipping', 'Details'],
            selectedTab: 'Shipping',
            shippings: ['fast','slow','urgent','pickup','Russian post']
        }
    },
})

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        updateCartTwo(id) {
            this.cart.pop(id);
        },
    }
})



