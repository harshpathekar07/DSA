class Solution {
public:
    void sortColors(vector<int>& nums) {
        int n =nums.size();
        int rp = n-1, lp = 0 , mid= 0;
        while (mid<=rp){
            if (nums[mid]==0){
                swap(nums[lp],nums[mid]);
                mid++;
                lp++;
            }
            else if(nums[mid]==1){
                mid++;
            }
            else{
                swap(nums[mid],nums[rp]);
                rp--;
            }
        }
    }
};